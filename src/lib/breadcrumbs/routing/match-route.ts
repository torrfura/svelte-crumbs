/**
 * Converts a file path from import.meta.glob to a clean route.
 * `/src/routes/(group)/products/+page.svelte` → `/products`
 * `/src/routes/(group)/products/+page@.svelte` → `/products`
 */
export function filePathToRoute(filePath: string): string {
	return (
		filePath
			.replace(/^\/src\/routes/, '')
			.replace(/\/\+page(@.*)?\.svelte$/, '')
			.replace(/\/\(.*?\)/g, '') || '/'
	);
}

/**
 * Checks whether a dynamic route pattern matches a concrete route.
 * `/products/[id]` matches `/products/123`
 */
export function matchDynamicRoutePattern(pattern: string, route: string): boolean {
	const routeSegments = route.split('/').filter(Boolean);
	const patternSegments = pattern.split('/').filter(Boolean);

	if (routeSegments.length !== patternSegments.length) return false;

	return patternSegments.every(
		(segment, i) =>
			(segment.startsWith('[') && segment.endsWith(']')) || segment === routeSegments[i]
	);
}
