export { createBreadcrumbs } from './breadcrumbs/create-breadcrumbs.svelte.js';

export { buildBreadcrumbMap } from './breadcrumbs/routing/build-breadcrumb-map.js';
export { filePathToRoute, matchDynamicRoute } from './breadcrumbs/routing/match-route.js';
export { getResolversForRoute } from './breadcrumbs/routing/get-resolvers-for-route.js';
export type {
	Breadcrumb,
	BreadcrumbData,
	BreadcrumbMap,
	BreadcrumbMeta,
	BreadcrumbResolver
} from './breadcrumbs/types.js';
