import { page } from '$app/state';
import { resolve } from '$app/paths';
import { browser } from '$app/env';
import type { Page } from '@sveltejs/kit';
import { getRouteIndex, stripGroups } from './routing/route-index.svelte.js';
import { walkRoute } from './routing/route-walk.js';
import type {
	Breadcrumb,
	BreadcrumbPage,
	BreadcrumbResolver,
	GetCrumbsOptions,
	OptionalPageField,
	PathTransform
} from './types.js';

/**
 * `resolve` is typed against the app's generated route ids. The paths handled
 * here are already-resolved pathnames, so the narrow type gets in the way.
 */
const resolvePath = resolve as unknown as (path: string) => string;

/**
 * Reads `config.kit.paths.base`. SvelteKit 3 removed the `base` export from
 * `$app/paths`, leaving `resolve('/')` — which is `${base}/`, or `${base}#/`
 * under hash routing — as the way to recover the value.
 *
 * Read on every call rather than cached at module scope: during SSR the base
 * path is relative to the page being rendered, and a value captured at import
 * time would be stale.
 */
function basePath(): string {
	return resolvePath('/').replace(/#?\/$/, '');
}

/** Removes `paths.base` from a pathname so matching runs in route space. */
function stripBase(pathname: string): string {
	const base = basePath();
	if (base && pathname.startsWith(base)) {
		const rest = pathname.slice(base.length);
		return rest.startsWith('/') ? rest : `/${rest}`;
	}
	return pathname;
}

/**
 * Re-prepends `paths.base` to a crumb URL so links resolve correctly, and adds
 * the `#` marker when the app uses hash routing.
 *
 * `resolve` is built for route ids, so it rejects non-absolute input and reads
 * `[` as a dynamic segment needing params. Neither can reach here: crumb urls
 * come from `walkRoute`, which slices the concrete pathname and always yields
 * an absolute, already-substituted path.
 */
function withBase(url: string): string {
	return resolvePath(url);
}

/**
 * Runs the user's `transformPath` over the current pathname and normalises the
 * result to a leading-slash path. Errors are isolated the same way resolver
 * errors are — a throwing transform is logged and the raw pathname is used, so
 * a broken transform degrades the trail instead of breaking the page.
 */
function transformPathname(
	pathname: string,
	url: URL,
	transformPath: PathTransform | undefined
): string {
	if (!transformPath) return pathname;

	let next: string;
	try {
		next = transformPath({ pathname, url });
	} catch (err) {
		console.warn(`[svelte-crumbs] transformPath threw for "${pathname}":`, err);
		return pathname;
	}

	if (!next) return '/';
	return next.startsWith('/') ? next : `/${next}`;
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
 * Calls each resolver in parallel, filters out undefined results, and
 * isolates errors per resolver — a single throwing resolver is logged
 * and skipped instead of taking down the entire breadcrumb trail.
 */
async function resolveCrumbs(
	resolvers: Map<string, BreadcrumbResolver>,
	snap: BreadcrumbPage
): Promise<Breadcrumb[]> {
	const results = await Promise.all(
		Array.from(resolvers, async ([url, resolver]) => {
			try {
				const data = await resolver(snap, url);
				return data ? ({ ...data, url: withBase(url) } as Breadcrumb) : undefined;
			} catch (err) {
				console.warn(`[svelte-crumbs] resolver for "${url}" threw:`, err);
				return undefined;
			}
		})
	);
	return results.filter((b): b is Breadcrumb => b !== undefined);
}

/**
 * Resolves the breadcrumb trail for the current route.
 *
 * Reads the reactive `page` state synchronously, so calling it inside
 * `$derived(await getCrumbs())`, `{#each await getCrumbs() as crumb}`, or
 * `{#await getCrumbs()}` tracks navigation and updates automatically.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { getCrumbs } from 'svelte-crumbs';
 *   const crumbs = $derived(await getCrumbs());
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
 * const crumbs = $derived(
 *   await getCrumbs({ transformPath: ({ pathname }) => deLocalizeHref(pathname) })
 * );
 * ```
 */
export async function getCrumbs(options: GetCrumbsOptions = {}): Promise<Breadcrumb[]> {
	const index = getRouteIndex(options.modules, options.routesPrefix);

	// All reactive reads MUST stay before the first await: on the server, `page`
	// is only readable while rendering, and in the consuming async derived only
	// synchronous reads are guaranteed to be tracked across environments.
	// `track()` subscribes to the index version, bumped once by the background
	// warmup — that re-run takes the fully synchronous path below, which keeps
	// reactive reads INSIDE resolvers (remote queries, $state) tracked as well.
	index.track();
	const routeId = page.route.id;
	const path = transformPathname(stripBase(page.url.pathname), page.url, options.transformPath);
	const snap = snapshotPage(page, options.include ?? [], path);

	// No matched route (error page rendered without a route) — no trail.
	if (routeId === null) return [];

	const levels = walkRoute(stripGroups(routeId), path, snap.params, options.restCrumbs);

	// Kick off the background warmup on the client (no-op after the first
	// call). Once it completes it bumps the index version from the idle task —
	// deliberately outside any derived run — re-running consumers on the
	// synchronous path so resolver-internal reactive reads become tracked.
	if (browser) index.scheduleWarmup();

	// Await ONLY when something on the current path actually needs loading —
	// correct data either way; tracking arrives with the warmup re-run.
	const pending = index.loadPending(options.eager ? undefined : levels.map((l) => l.routeId));
	if (pending) await pending;

	// Concrete-pathname keys win over route-id keys at the same level; deeper
	// levels sharing a URL (absent optional params, zero-segment rest) win
	// over shallower ones.
	const matched = new Map<string, BreadcrumbResolver>();
	for (const level of levels) {
		const resolver = index.resolvers.get(level.url) ?? index.resolvers.get(level.routeId);
		if (resolver) matched.set(level.url, resolver);
	}

	return resolveCrumbs(matched, snap);
}

/**
 * @deprecated Call {@link getCrumbs} directly — the factory holds no state.
 * `createBreadcrumbs(options)()` and `getCrumbs(options)` are equivalent.
 */
export function createBreadcrumbs(options?: GetCrumbsOptions): () => Promise<Breadcrumb[]> {
	return () => getCrumbs(options);
}
