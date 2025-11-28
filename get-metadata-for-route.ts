import type { MetadataAsyncMap } from '../types';

const isDynamicSegmentMatch = (patternSegment: string, routeSegment: string): boolean => {
  return (patternSegment.startsWith('[') && patternSegment.endsWith(']')) || patternSegment === routeSegment;
};

const matchDynamicRoute = (metadataMap: MetadataAsyncMap, routeSegments: string[]) => {
  const matchingPattern = Array.from(metadataMap.keys()).find((pattern) => {
    const patternSegments = pattern.split('/').filter(Boolean);

    return (
      routeSegments.length === patternSegments.length &&
      patternSegments.every((segment, i) => isDynamicSegmentMatch(segment, routeSegments[i]))
    );
  });

  return matchingPattern ? metadataMap.get(matchingPattern) : undefined;
};

export function getMetadataForRoute(metadataMap: MetadataAsyncMap, route: string) {
  const metadataAsyncMap: MetadataAsyncMap = new Map();
  const routeSegments = route.split('/').filter(Boolean);

  // Handle root route
  const segments = routeSegments.length === 0 ? [''] : routeSegments;

  let currentPath = '';
  const builtSegments: string[] = [];

  for (const segment of segments) {
    currentPath += `/${segment}`;
    builtSegments.push(segment);

    const metadata = metadataMap.get(currentPath) ?? matchDynamicRoute(metadataMap, builtSegments);

    if (metadata) {
      metadataAsyncMap.set(currentPath, metadata);
    }
  }

  return metadataAsyncMap;
}
