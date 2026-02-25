import { page } from '$app/state';
import type { Page } from '@sveltejs/kit';
import { buildBreadcrumbMap } from './routing/build-breadcrumb-map.js';
import { getResolversForRoute } from './routing/get-resolvers-for-route.js';
import type { Breadcrumb, BreadcrumbMap } from './types.js';

/** Calls each resolver in parallel and filters out undefined results. */
async function resolve(resolvers: BreadcrumbMap, snap: Page): Promise<Breadcrumb[]> {
	const results = await Promise.all(
		Array.from(resolvers, async ([url, resolver]) => {
			const data = await resolver(snap, url);
			return data ? ({ ...data, url } as Breadcrumb) : undefined;
		})
	);
	return results.filter((b): b is Breadcrumb => b !== undefined);
}

/**
 * Captures a plain-object snapshot of `page` state.
 * Resolvers receive this instead of the live proxy so they can be called
 * outside the SSR rendering context (i.e. after an `await` boundary).
 */
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
 */
export function createBreadcrumbs() {
	const { ready, lookup } = buildBreadcrumbMap();

	let loaded = $state(false);

	// Derived values that read the live `page` proxy. They are evaluated
	// synchronously (before any await) inside the returned function, which
	// pins them to the SSR rendering context and caches them for later reads.
	const pathname = $derived(page.url.pathname);
	const pageSnapshot = $derived(snapshotPage(page));

	// Sync derived — re-evaluates when the pathname changes or modules finish
	// loading. Reads `pathname` (cached) rather than `page.url` directly so it
	// stays safe after an await boundary on the server.
	const resolversForRoute = $derived(
		loaded ? getResolversForRoute(lookup, pathname) : (new Map() as BreadcrumbMap)
	);

	return async () => {
		// Evaluate derived values synchronously — this caches them inside the
		// SSR rendering context so reads after the await use cached values.
		const snap = pageSnapshot;
		void pathname;

		if (!loaded) {
			await ready;
			loaded = true;
		}

		// Sync read — no await between here and resolve(), so Svelte's
		// reactive tracking reaches into resolver calls (e.g. queries).
		return resolve(resolversForRoute, snap);
	};
}
