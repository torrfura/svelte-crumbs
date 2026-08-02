import { page } from '$app/state';
import type { Page } from '@sveltejs/kit';
import { buildBreadcrumbMap } from './routing/build-breadcrumb-map.js';
import { getResolversForRoute } from './routing/get-resolvers-for-route.js';
import type {
	Breadcrumb,
	BreadcrumbMap,
	BreadcrumbPage,
	CreateBreadcrumbsOptions,
	OptionalPageField,
	PathTransform
} from './types.js';

/**
 * Calls each resolver in parallel, filters out undefined results, and
 * isolates errors per resolver — a single throwing resolver is logged
 * and skipped instead of taking down the entire breadcrumb trail.
 */
async function resolve(resolvers: BreadcrumbMap, snap: BreadcrumbPage): Promise<Breadcrumb[]> {
	const results = await Promise.all(
		Array.from(resolvers, async ([url, resolver]) => {
			try {
				const data = await resolver(snap, url);
				return data ? ({ ...data, url } as Breadcrumb) : undefined;
			} catch (err) {
				console.warn(`[svelte-crumbs] resolver for "${url}" threw:`, err);
				return undefined;
			}
		})
	);
	return results.filter((b): b is Breadcrumb => b !== undefined);
}

/**
 * Runs the user's `transformPath` over the current pathname and normalises the
 * result to a leading-slash path. Errors are isolated the same way resolver
 * errors are — a throwing transform is logged and the raw pathname is used, so
 * a broken transform degrades the trail instead of breaking the page.
 */
function transformPathname(url: URL, transformPath: PathTransform | undefined): string {
	if (!transformPath) return url.pathname;

	let next: string;
	try {
		next = transformPath({ pathname: url.pathname, url });
	} catch (err) {
		console.warn(`[svelte-crumbs] transformPath threw for "${url.pathname}":`, err);
		return url.pathname;
	}

	if (!next) return '/';
	return next.charCodeAt(0) === 47 /* '/' */ ? next : `/${next}`;
}

/**
 * Captures a plain-object snapshot of `page` state.
 * Only reads core fields (`url`, `params`, `route`, `data`) by default.
 * Optional fields (`status`, `error`, `form`, `state`) are only read when
 * explicitly opted in via `include`, avoiding unnecessary Svelte reactive
 * dependencies on rarely-used page properties.
 *
 * `pathname` is the already-transformed path. When it differs from the live
 * one, the clone is rebuilt around it so `href`, `pathname`, and everything
 * derived from them stay consistent with what resolvers are matched against.
 */
function snapshotPage(p: Page, include: OptionalPageField[], pathname: string): BreadcrumbPage {
	const url =
		pathname === p.url.pathname
			? new URL(p.url.href)
			: new URL(`${pathname}${p.url.search}${p.url.hash}`, p.url.origin);

	const snap: BreadcrumbPage = {
		url: url as Page['url'],
		params: { ...p.params },
		route: { id: p.route.id },
		data: p.data
	};

	for (const field of include) {
		(snap as Record<string, unknown>)[field] = p[field];
	}

	return snap;
}

/**
 * Creates a reactive breadcrumb resolver that tracks the current route.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createBreadcrumbs } from 'svelte-crumbs';
 *
 *   const getBreadcrumbs = createBreadcrumbs();
 *   const crumbs = $derived(await getBreadcrumbs());
 * </script>
 *
 * {#each crumbs as crumb}
 *   <a href={crumb.url}>{crumb.label}</a>
 * {/each}
 * ```
 *
 * @example Stripping an i18n prefix (Paraglide, i18n-routing, …)
 * ```ts
 * import { deLocalizeHref } from '$lib/paraglide/runtime';
 *
 * const getBreadcrumbs = createBreadcrumbs({
 *   transformPath: ({ pathname }) => deLocalizeHref(pathname)
 * });
 * ```
 */
export function createBreadcrumbs(options?: CreateBreadcrumbsOptions) {
	const include = options?.include ?? [];
	const transformPath = options?.transformPath;
	const { ready, lookup } = buildBreadcrumbMap();

	let loaded = $state(false);

	// Derived values that read the live `page` proxy. They are evaluated
	// synchronously (before any await) inside the returned function, which
	// pins them to the SSR rendering context and caches them for later reads.
	const pathname = $derived(transformPathname(page.url, transformPath));
	const pageSnapshot = $derived(snapshotPage(page, include, pathname));

	return async () => {
		// Evaluate derived values synchronously — this caches them inside the
		// SSR rendering context so reads after the await use cached values.
		const snap = pageSnapshot;
		const path = pathname;

		if (!loaded) {
			await ready;
			loaded = true;
		}

		const resolvers = getResolversForRoute(lookup, path);
		return resolve(resolvers, snap);
	};
}
