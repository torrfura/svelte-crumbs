import { page } from '$app/state';
import type { Page } from '@sveltejs/kit';
import { buildBreadcrumbMap } from './routing/build-breadcrumb-map.js';
import { getResolversForRoute } from './routing/get-resolvers-for-route.js';
import type { Breadcrumb, BreadcrumbMap } from './types.js';

async function resolve(resolvers: BreadcrumbMap, pageSnapshot: Page): Promise<Breadcrumb[]> {
	const promises = Array.from(resolvers).map(async ([url, resolver]) => {
		const data = await resolver(pageSnapshot);
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
	const map = buildBreadcrumbMap();
	const pathname = $derived(page.url.pathname);
	const pageSnapshot = $derived(snapshotPage(page));

	return async () => {
		// Read derived values synchronously before any await — during SSR these
		// must be evaluated inside the rendering context or page.params throws.
		const snap = pageSnapshot;
		const path = pathname;

		const resolvers = await getResolversForRoute(map, path);
		return resolve(resolvers, snap);
	};
}
