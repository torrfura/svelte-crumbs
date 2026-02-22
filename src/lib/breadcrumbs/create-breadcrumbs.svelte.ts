import { page } from '$app/state';
import { buildBreadcrumbMap } from '../routing/build-breadcrumb-map.js';
import { getResolversForRoute } from '../routing/get-resolvers-for-route.js';
import type { Breadcrumb } from '../types.js';

async function resolve(resolvers: ReturnType<typeof getResolversForRoute>): Promise<Breadcrumb[]> {
	const promises = Array.from(resolvers).map(async ([url, resolver]) => {
		const data = await resolver(page);
		if (!data) return undefined;
		return { ...data, url } as Breadcrumb;
	});

	const results = await Promise.all(promises);
	return results.filter((b): b is Breadcrumb => b !== undefined);
}

/**
 * Creates a reactive breadcrumb resolver that automatically tracks the current route.
 * Uses top-level await with SvelteKit's async experimental compiler option for SSR support.
 *
 * Usage:
 * ```svelte
 * <script lang="ts">
 *   import { createBreadcrumbs } from 'svelte-breadcrumbs';
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
	const map = buildBreadcrumbMap();
	const resolversForRoute = $derived(getResolversForRoute(map, page.url.pathname));

	return () => resolve(resolversForRoute);
}
