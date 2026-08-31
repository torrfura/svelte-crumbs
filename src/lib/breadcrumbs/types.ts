import type { Component } from 'svelte';
import type { Page } from '@sveltejs/kit';

/** Optional page fields that are not tracked by default. */
export type OptionalPageField = 'status' | 'error' | 'form' | 'state';

/** Page snapshot passed to breadcrumb resolvers. Core fields are always present; optional fields require opt-in via `include`. */
export type BreadcrumbPage = Pick<Page, 'url' | 'params' | 'route' | 'data'> &
	Partial<Pick<Page, OptionalPageField>>;

/**
 * Rewrites the current pathname before route matching. Receives the pathname
 * (with `paths.base` already stripped) and the untransformed page URL.
 * Useful for stripping i18n locale prefixes (Paraglide & friends).
 */
export type PathTransform = (context: { pathname: string; url: URL }) => string;

/** How `[...rest]` segments are turned into crumbs. */
export type RestCrumbMode = 'per-segment' | 'single';

/** Options for `getCrumbs`. */
export interface GetCrumbsOptions {
	/** Extra `page` fields to expose to resolvers. Off by default so breadcrumbs don't take reactive dependencies on rarely-used properties. */
	include?: OptionalPageField[];
	/** Rewrites the current pathname before route matching. See `PathTransform`. */
	transformPath?: PathTransform;
	/**
	 * Load every page module up front instead of only the modules along the
	 * current path. Needed only when a `{ routes }` export registers crumbs
	 * for routes unrelated to the declaring page.
	 */
	eager?: boolean;
	/** One crumb per `[...rest]` segment (default) or a single crumb for the whole rest value. */
	restCrumbs?: RestCrumbMode;
	/**
	 * Override page discovery with your own `import.meta.glob` record —
	 * for non-default route directories or tests. Hoist the glob to module
	 * scope so the record is stable across calls.
	 */
	modules?: Record<string, () => Promise<unknown>>;
	/** File-path prefix stripped when deriving route ids from `modules` keys. Defaults to `/src/routes`. */
	routesPrefix?: string;
}

/** @deprecated Use `GetCrumbsOptions`. */
export type CreateBreadcrumbsOptions = GetCrumbsOptions;

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
