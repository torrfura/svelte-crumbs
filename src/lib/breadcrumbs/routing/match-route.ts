/**
 * Converts a file path from `import.meta.glob` to a clean route pattern.
 *
 * @example
 * filePathToRoute('/src/routes/(group)/products/+page.svelte')  // → '/products'
 * filePathToRoute('/src/routes/products/+page@admin.svelte')    // → '/products'
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
 * Tests whether a route pattern matches a concrete URL path.
 * Supports static segments, dynamic `[param]` segments, and `[...rest]` spread segments.
 *
 * @example
 * matchDynamicRoutePattern('/products/[id]', '/products/42')           // → true
 * matchDynamicRoutePattern('/docs/[...slug]', '/docs/a/b/c')           // → true
 * matchDynamicRoutePattern('/docs/[...slug]', '/docs')                 // → false
 */
export function matchDynamicRoutePattern(pattern: string, route: string): boolean {
	const routeSegments = route.split('/').filter(Boolean);
	const patternSegments = pattern.split('/').filter(Boolean);

	for (let i = 0; i < patternSegments.length; i++) {
		const seg = patternSegments[i];

		if (seg.startsWith('[...') && seg.endsWith(']')) {
			return routeSegments.length > i;
		}

		if (i >= routeSegments.length) return false;
		if (seg.startsWith('[') && seg.endsWith(']')) continue;
		if (seg !== routeSegments[i]) return false;
	}

	return routeSegments.length === patternSegments.length;
}
