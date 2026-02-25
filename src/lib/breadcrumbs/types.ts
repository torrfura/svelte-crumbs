import type { Component } from 'svelte';
import type { Page } from '@sveltejs/kit';

/** What users export from +page.svelte as `breadcrumb` */
export type BreadcrumbMeta = BreadcrumbResolver | { routes: Record<string, BreadcrumbResolver> };

/** Async resolver function that receives the current page and the breadcrumb's own URL */
export type BreadcrumbResolver = (page: Page, url: string) => Promise<BreadcrumbData | undefined>;

/** Resolved data for one breadcrumb */
export type BreadcrumbData = { label: string; icon?: Component<any> };

/** Final breadcrumb with its URL */
export type Breadcrumb = BreadcrumbData & { url: string };

/** Loader function returned by non-eager import.meta.glob */
export type PageModuleLoader = () => Promise<{ breadcrumb?: BreadcrumbMeta }>;

/** Internal map from route pattern to resolver */
export type BreadcrumbMap = Map<string, BreadcrumbResolver>;
