import type { BreadcrumbMap, BreadcrumbResolver } from '../types.js';

/**
 * Converts a file path from import.meta.glob to a clean route.
 * `/src/routes/(group)/products/+page.svelte` → `/products`
 */
export function filePathToRoute(filePath: string): string {
	return (
		filePath
			.replace(/^\/src\/routes/, '')
			.replace(/\/\+page\.svelte$/, '')
			.replace(/\/\(.*?\)/g, '') || '/'
	);
}

/**
 * Matches a concrete route against dynamic patterns in the breadcrumb map.
 * `/products/123` matches `/products/[id]`
 */
export function matchDynamicRoute(
	map: BreadcrumbMap,
	route: string
): BreadcrumbResolver | undefined {
	const routeSegments = route.split('/').filter(Boolean);

	for (const [pattern, resolver] of map) {
		const patternSegments = pattern.split('/').filter(Boolean);

		if (routeSegments.length !== patternSegments.length) continue;

		const isMatch = patternSegments.every(
			(segment, i) =>
				(segment.startsWith('[') && segment.endsWith(']')) || segment === routeSegments[i]
		);

		if (isMatch) return resolver;
	}

	return undefined;
}
