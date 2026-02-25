import type { LazyBreadcrumbMap } from './build-breadcrumb-map.js';
import type { BreadcrumbMap } from '../types.js';

/**
 * Walks route segments from root to leaf, collecting ordered resolvers.
 * For `/products/123/edit`, checks `/`, `/products`, `/products/123`, `/products/123/edit`.
 */
export async function getResolversForRoute(
	map: LazyBreadcrumbMap,
	route: string
): Promise<BreadcrumbMap> {
	const resolvers: BreadcrumbMap = new Map();

	// Always check root first
	const rootResolver = await map.get('/');
	if (rootResolver) {
		resolvers.set('/', rootResolver);
	}

	const segments = route.split('/').filter(Boolean);
	let currentRoute = '';

	for (const segment of segments) {
		currentRoute += `/${segment}`;
		const resolver = await map.get(currentRoute);

		if (!resolver) continue;

		resolvers.set(currentRoute, resolver);
	}

	return resolvers;
}
