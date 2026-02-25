import { filePathToRoute, matchDynamicRoutePattern } from './match-route.js';
import type { BreadcrumbMeta, BreadcrumbResolver, PageModuleLoader } from '../types.js';

/**
 * Sync breadcrumb lookup built from eagerly-loaded modules.
 * Supports exact, dynamic [param], and [...spread] route matching.
 */
export class BreadcrumbLookup {
	/** All route→resolver entries (mutated during async init, then stable). */
	readonly resolvers: Map<string, BreadcrumbResolver>;

	constructor(resolvers: Map<string, BreadcrumbResolver>) {
		this.resolvers = resolvers;
	}

	/** Sync lookup: exact match → dynamic pattern → spread pattern. */
	get(route: string): BreadcrumbResolver | undefined {
		const exact = this.resolvers.get(route);
		if (exact) return exact;

		for (const [pattern, resolver] of this.resolvers) {
			if (matchDynamicRoutePattern(pattern, route)) return resolver;
		}

		return undefined;
	}
}

/**
 * Loads all +page.svelte modules in parallel and builds a sync BreadcrumbLookup.
 * Uses non-eager import.meta.glob so full component code is not bundled into
 * the breadcrumb map — only the module-level `breadcrumb` export is read.
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
