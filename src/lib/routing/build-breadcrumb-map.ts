import { filePathToRoute } from './match-route.js';
import type { BreadcrumbMap, BreadcrumbMeta, BreadcrumbResolver } from '../types.js';

/**
 * Scans all +page.svelte files via import.meta.glob for `breadcrumb` exports
 * and builds a map from route pattern to resolver function.
 */
export function buildBreadcrumbMap(): BreadcrumbMap {
	const map: BreadcrumbMap = new Map();
	const pageModules = import.meta.glob<{ breadcrumb?: BreadcrumbMeta }>(
		'/src/routes/**/+page.svelte',
		{ eager: true }
	);

	for (const [filePath, module] of Object.entries(pageModules)) {
		if (!module?.breadcrumb) continue;

		const route = filePathToRoute(filePath);
		const meta = module.breadcrumb;

		const routes: Record<string, BreadcrumbResolver> =
			'routes' in meta ? meta.routes : { [route]: meta as BreadcrumbResolver };

		for (const [routeKey, resolver] of Object.entries(routes)) {
			map.set(routeKey, resolver);
		}
	}

	return map;
}
