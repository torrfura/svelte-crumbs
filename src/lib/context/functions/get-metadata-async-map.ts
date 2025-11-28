import type { AsyncMetaData, PageMetaData } from '../types';

export function getMetadataAsyncMap() {
  const metadataAsyncMap = new Map<string, AsyncMetaData>();
  const pageModules = import.meta.glob<{ metadata?: PageMetaData }>('/src/routes/**/*.svelte', {
    eager: true
  });

  for (const [filePath, module] of Object.entries(pageModules)) {
    if (module?.metadata) {
      const route =
        filePath
          .replace(/^\/src\/routes/, '')
          .replace(/\/\+page\.svelte$/, '')
          .replace(/\/\(.*?\)/g, '') || // Remove route groups
        '/';

      const routes = 'routes' in module.metadata ? module.metadata.routes : { [route]: module.metadata };
      for (const [route, asyncMetaData] of Object.entries(routes)) {
        metadataAsyncMap.set(route, asyncMetaData);
      }
    }
  }

  return metadataAsyncMap;
}
