export { createBreadcrumbs } from './breadcrumbs/create-breadcrumbs.svelte.js';
export { buildBreadcrumbMap } from './routing/build-breadcrumb-map.js';
export { filePathToRoute, matchDynamicRoute } from './routing/match-route.js';
export { getResolversForRoute } from './routing/get-resolvers-for-route.js';
export type {
	Breadcrumb,
	BreadcrumbData,
	BreadcrumbMap,
	BreadcrumbMeta,
	BreadcrumbResolver
} from './types.js';
