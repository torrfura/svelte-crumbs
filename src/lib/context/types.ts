import type { Page } from '@sveltejs/kit';
import type {Component} from "svelte";

export type MetadataAsyncMap = Map<string, AsyncMetaData>;

export type PageMetaData = StaticPageMetaData | DynamicPageMetaData;

export type PageMetaBreadcrumb = {
  label: string;
  icon?: Component
};

export type Breadcrumb = {
  label: string;
  url?: string;
  icon?: Component;
};

type StaticPageMetaData = AsyncMetaData;
type DynamicPageMetaData = { routes: Record<string, AsyncMetaData> };

export type AsyncMetaData = (page: Page) => Promise<MetaData>;

export type MetaData = {
  breadcrumb?: PageMetaBreadcrumb;
  ai?: {
    label: string;
    context: string;
  };
};
