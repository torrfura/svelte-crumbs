import type { Component } from 'svelte';
import type { Page } from '@sveltejs/kit';

/** What users export from +page.svelte as `breadcrumb`. */
export type BreadcrumbMeta = BreadcrumbResolver | { routes: Record<string, BreadcrumbResolver> };

/**
 * Async function that resolves breadcrumb data for a route segment.
 * Receives the current page state and the breadcrumb's own URL path.
 */
export type BreadcrumbResolver = (
	page: Page,
	url: string
) => Promise<BreadcrumbData | undefined>;

/** Resolved data for a single breadcrumb. */
export type BreadcrumbData = { label: string; icon?: Component };

/** Breadcrumb with its resolved data and URL. */
export type Breadcrumb = BreadcrumbData & { url: string };

/** Internal: loader function returned by non-eager `import.meta.glob`. */
export type PageModuleLoader = () => Promise<{ breadcrumb?: BreadcrumbMeta }>;

/** Internal: ordered map from concrete URL path to resolver. */
export type BreadcrumbMap = Map<string, BreadcrumbResolver>;
