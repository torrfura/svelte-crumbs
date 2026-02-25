import { page } from '$app/state';
import type { Page } from '@sveltejs/kit';
import { buildBreadcrumbMap } from './routing/build-breadcrumb-map.js';
import { getResolversForRoute } from './routing/get-resolvers-for-route.js';
import type { Breadcrumb, BreadcrumbMap } from './types.js';

async function resolve(resolvers: BreadcrumbMap, pageSnapshot: Page): Promise<Breadcrumb[]> {
	const promises = Array.from(resolvers).map(async ([url, resolver]) => {
		const data = await resolver(pageSnapshot, url);
		if (!data) return undefined;
		return { ...data, url } as Breadcrumb;
	});

	const results = await Promise.all(promises);
	return results.filter((b): b is Breadcrumb => b !== undefined);
}

/** Capture a plain-object snapshot of page state so resolvers can read it outside component context. */
function snapshotPage(p: Page): Page {
	return {
		url: new URL(p.url.href) as Page['url'],
		params: { ...p.params },
		route: { id: p.route.id },
		status: p.status,
		error: p.error,
		data: p.data,
		form: p.form,
		state: p.state
	};
}

/**
 * Creates a reactive breadcrumb resolver that automatically tracks the current route.
 * Uses top-level await with SvelteKit's async experimental compiler option for SSR support.
 *
 * Usage:
 * ```svelte
 * <script lang="ts">
 *   import { createBreadcrumbs } from 'svelte-crumbs';
 *   const getBreadcrumbs = createBreadcrumbs();
 *   const crumbs = $derived(await getBreadcrumbs());
 * </script>
 *
 * {#each crumbs as crumb}
 *   <a href={crumb.url}>{crumb.label}</a>
 * {/each}
 * ```
 */
export function createBreadcrumbs() {
	const { ready, lookup } = buildBreadcrumbMap();

	let loaded = $state(false);

	// $derived values that read the reactive page proxy.
	// These are read synchronously (before any await) inside the returned
	// function, which caches them in the rendering context on SSR.
	const pathname = $derived(page.url.pathname);
	const pageSnapshot = $derived(snapshotPage(page));

	// Sync $derived — exactly like the original pre-lazy pattern.
	// Re-evaluates when pathname changes or when modules finish loading.
	// Reads `pathname` (not page.url directly) so it uses the cached value
	// after an await boundary on SSR.
	const resolversForRoute = $derived(
		loaded ? getResolversForRoute(lookup, pathname) : (new Map() as BreadcrumbMap)
	);

	return async () => {
		// Read derived values synchronously — caches them in the SSR rendering
		// context so subsequent reads (after await) use cached values.
		const snap = pageSnapshot;
		void pathname;

		// On first call (SSR), wait for all modules to load.
		if (!loaded) {
			await ready;
			loaded = true;
		}

		// Sync read of $derived — establishes reactive tracking.
		// When queries like getNickname() are called inside resolve(),
		// their signals are tracked because there is no await before this point
		// on subsequent calls (loaded === true).
		const resolvers = resolversForRoute;

		return resolve(resolvers, snap);
	};
}
