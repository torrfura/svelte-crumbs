import type { MetadataAsyncMap } from '../types';

const matchDynamicRoute = (metadataMap: MetadataAsyncMap, route: string) => {
  const routeSegments = route.split('/').filter(Boolean);

  for (const [pattern] of metadataMap) {
    const patternSegments = pattern.split('/').filter(Boolean);

    if (routeSegments.length !== patternSegments.length) continue;

    const isMatch = patternSegments.every((segment, i) => {
      return (segment.startsWith('[') && segment.endsWith(']')) || segment === routeSegments[i];
    });

    if (isMatch) return metadataMap.get(pattern);
  }

  return undefined;
};

export function getMetadataForRoute(metadataMap: MetadataAsyncMap, route: string) {
  const metadataAsyncMap: MetadataAsyncMap = new Map();
  const routeSegments = route.split('/').filter(Boolean);
  if (routeSegments.length === 0) {
    routeSegments.push('');
  }
  let currentRoute = '';
  for (const routeSegment of routeSegments) {
    currentRoute += `/${routeSegment}`;
    const metadata = metadataMap.get(currentRoute) ?? matchDynamicRoute(metadataMap, currentRoute);

    if (!metadata) continue;
    metadataAsyncMap.set(currentRoute, metadata);
  }

  return metadataAsyncMap;
}
