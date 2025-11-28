import { page } from '$app/state';
import { getMetadataAsyncMap } from './functions/get-metadata-async-map';
import { getMetadataForRoute } from './functions/get-metadata-for-route';

import type {AsyncMetaData, Breadcrumb} from './types';

import {getContext, setContext} from "svelte";

export class PageMetaData {
  readonly #metadataAsyncMap: Map<string, AsyncMetaData>;
  readonly #route: string;
  readonly #metadataForCurrentRoute: Map<string, AsyncMetaData>;

  constructor() {
    this.#metadataAsyncMap = getMetadataAsyncMap();
    this.#route = $derived(page.url.pathname);
    this.#metadataForCurrentRoute = $derived(getMetadataForRoute(this.#metadataAsyncMap, this.#route));
  }

  async getBreadcrumbs() {
    const breadcrumbsPromises = Array.from(this.#metadataForCurrentRoute)
      .map(async ([route, getMetadata]) => {
        const metadata = await getMetadata(page);

        if (metadata.breadcrumb) {
          const breadcrumb: Breadcrumb = {
            ...metadata.breadcrumb,
            url: route
          };
          return breadcrumb;
        }
      })
      .filter((breadcrumb) => breadcrumb !== undefined);

    const breadcrumbs = await Promise.all(breadcrumbsPromises as Promise<Breadcrumb>[]);
    return breadcrumbs.filter((breadcrumb) => breadcrumb !== undefined) as Breadcrumb[];
  }
}

const PAGE_METADATA_CONTEXT_KEY = Symbol('APP_CONTEXT_KEY');

export function getMetadataContext() {
  return getContext<PageMetaData>(PAGE_METADATA_CONTEXT_KEY);
}

export function setMetadataContext(): PageMetaData {
  const appCtx = getContext<PageMetaData>(PAGE_METADATA_CONTEXT_KEY);
  if (appCtx) {
    console.warn('Page Metadata context is already set');
    return appCtx;
  }
  return setContext(PAGE_METADATA_CONTEXT_KEY, new PageMetaData());
}
