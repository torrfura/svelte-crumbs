export { createBreadcrumbs } from './breadcrumbs/create-breadcrumbs.svelte.js';

export { buildBreadcrumbMap, BreadcrumbLookup } from './breadcrumbs/routing/build-breadcrumb-map.js';
export { filePathToRoute, matchDynamicRoutePattern } from './breadcrumbs/routing/match-route.js';
export { getResolversForRoute } from './breadcrumbs/routing/get-resolvers-for-route.js';

export type {
	Breadcrumb,
	BreadcrumbData,
	BreadcrumbMap,
	BreadcrumbMeta,
	BreadcrumbPage,
	BreadcrumbResolver,
	CreateBreadcrumbsOptions,
	OptionalPageField
} from './breadcrumbs/types.js';
