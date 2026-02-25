import { filePathToRoute, matchDynamicRoutePattern } from './match-route.js';
import type { BreadcrumbMeta, BreadcrumbResolver, PageModuleLoader } from '../types.js';

/**
 * Synchronous breadcrumb resolver lookup.
 * Supports exact, dynamic `[param]`, and `[...spread]` route matching.
 */
export class BreadcrumbLookup {
	#resolvers: Map<string, BreadcrumbResolver>;

	constructor(resolvers: Map<string, BreadcrumbResolver>) {
		this.#resolvers = resolvers;
	}

	/** Looks up a resolver by exact match, then dynamic/spread pattern match. */
	get(route: string): BreadcrumbResolver | undefined {
		const exact = this.#resolvers.get(route);
		if (exact) return exact;

		for (const [pattern, resolver] of this.#resolvers) {
			if (pattern.includes('[') && matchDynamicRoutePattern(pattern, route)) {
				return resolver;
			}
		}

		return undefined;
	}
}

/**
 * Scans all `+page.svelte` files for `breadcrumb` exports using non-eager
 * `import.meta.glob`. Modules are loaded in parallel on first access;
 * after that, all lookups are synchronous.
 *
 * @returns `lookup` for sync route resolution, `ready` to await initial load.
 */
export function buildBreadcrumbMap(): { ready: Promise<void>; lookup: BreadcrumbLookup } {
	const pageModules = import.meta.glob<{ breadcrumb?: BreadcrumbMeta }>(
		'/src/routes/**/+page.svelte'
	);

	const resolvers = new Map<string, BreadcrumbResolver>();
	const lookup = new BreadcrumbLookup(resolvers);

	const ready = Promise.all(
		Object.entries(pageModules).map(async ([filePath, loader]) => {
			const module = await (loader as PageModuleLoader)();
			if (!module?.breadcrumb) return;

			const route = filePathToRoute(filePath);
			const meta = module.breadcrumb;
			const routes: Record<string, BreadcrumbResolver> =
				'routes' in meta ? meta.routes : { [route]: meta as BreadcrumbResolver };

			for (const [routeKey, resolver] of Object.entries(routes)) {
				resolvers.set(routeKey, resolver);
			}
		})
	).then(() => {});

	return { ready, lookup };
}
