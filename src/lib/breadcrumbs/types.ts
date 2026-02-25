import type { Component } from 'svelte';
import type { Page } from '@sveltejs/kit';

/** Optional page fields that are not tracked by default. */
export type OptionalPageField = 'status' | 'error' | 'form' | 'state';

/** Page snapshot passed to breadcrumb resolvers. Core fields are always present; optional fields require opt-in via `include`. */
export type BreadcrumbPage = Pick<Page, 'url' | 'params' | 'route' | 'data'> &
	Partial<Pick<Page, OptionalPageField>>;

/** Options for `createBreadcrumbs`. */
export type CreateBreadcrumbsOptions = { include?: OptionalPageField[] };

/** What users export from +page.svelte as `breadcrumb`. */
export type BreadcrumbMeta = BreadcrumbResolver | { routes: Record<string, BreadcrumbResolver> };

/**
 * Async function that resolves breadcrumb data for a route segment.
 * Receives the current page state and the breadcrumb's own URL path.
 */
export type BreadcrumbResolver = (
	page: BreadcrumbPage,
	url: string
) => Promise<BreadcrumbData | undefined>;

/** Resolved data for a single breadcrumb. */
export type BreadcrumbData = { label: string; icon?: Component };

/** Breadcrumb with its resolved data and URL. */
export type Breadcrumb = BreadcrumbData & { url: string };

/** Internal: loader function returned by non-eager `import.meta.glob` with named import. */
export type PageModuleLoader = () => Promise<BreadcrumbMeta | undefined>;

/** Internal: ordered map from concrete URL path to resolver. */
export type BreadcrumbMap = Map<string, BreadcrumbResolver>;
