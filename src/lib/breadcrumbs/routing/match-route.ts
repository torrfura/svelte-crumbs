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
 * `/spread/[...rest]` matches `/spread/a/b/c`
 */
export function matchDynamicRoutePattern(pattern: string, route: string): boolean {
	const routeSegments = route.split('/').filter(Boolean);
	const patternSegments = pattern.split('/').filter(Boolean);

	for (let i = 0; i < patternSegments.length; i++) {
		const seg = patternSegments[i];

		// Spread segment matches all remaining route segments
		if (seg.startsWith('[...') && seg.endsWith(']')) {
			return routeSegments.length >= i + 1;
		}

		// Not enough route segments
		if (i >= routeSegments.length) return false;

		// Dynamic segment matches anything
		if (seg.startsWith('[') && seg.endsWith(']')) continue;

		// Static segment must match exactly
		if (seg !== routeSegments[i]) return false;
	}

	return routeSegments.length === patternSegments.length;
}
