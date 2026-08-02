import type { Component } from 'svelte';
import type { Page } from '@sveltejs/kit';

/** Optional page fields that are not tracked by default. */
export type OptionalPageField = 'status' | 'error' | 'form' | 'state';

/** Page snapshot passed to breadcrumb resolvers. Core fields are always present; optional fields require opt-in via `include`. */
export type BreadcrumbPage = Pick<Page, 'url' | 'params' | 'route' | 'data'> &
	Partial<Pick<Page, OptionalPageField>>;

/** Context handed to a {@link PathTransform}. Both fields are untransformed. */
export type PathTransformContext = {
	/** The current `page.url.pathname`. */
	pathname: string;
	/** The full page URL — for locale detection via host, search params, … */
	url: URL;
};

/**
 * Rewrites the current pathname before it is used for route matching and
 * before it is handed to resolvers. Useful for stripping i18n prefixes — e.g.
 * Paraglide's `/nl/products` → `/products` — so breadcrumbs line up with the
 * real route tree.
 *
 * The return value is normalised to a leading-slash path; an empty string
 * becomes `/`.
 *
 * @example
 * ```ts
 * ({ pathname }) => deLocalizeHref(pathname)
 * ```
 */
export type PathTransform = (context: PathTransformContext) => string;

/** Options for `createBreadcrumbs`. */
export type CreateBreadcrumbsOptions = {
	include?: OptionalPageField[];
	/**
	 * Rewrites `page.url.pathname` before route matching. The transformed path is
	 * also reflected in the `url` (and therefore `href`) of the page snapshot
	 * passed to resolvers, and in the `url` of every resolved breadcrumb.
	 */
	transformPath?: PathTransform;
};

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
