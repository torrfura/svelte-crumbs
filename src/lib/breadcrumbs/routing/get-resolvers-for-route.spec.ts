import { describe, it, expect } from 'vitest';
import { getResolversForRoute } from './get-resolvers-for-route.js';
import { LazyBreadcrumbMap } from './build-breadcrumb-map.js';
import type { BreadcrumbResolver, PageModuleLoader } from '../types.js';

const makeResolver = (label: string): BreadcrumbResolver => async () => ({ label });

/** Helper: builds a LazyBreadcrumbMap from route → resolver entries */
function buildTestMap(entries: [string, BreadcrumbResolver][]): LazyBreadcrumbMap {
	const loaders: Record<string, PageModuleLoader> = {};
	for (const [route, resolver] of entries) {
		// Simulate glob path: /src/routes{route}/+page.svelte
		const filePath = route === '/' ? '/src/routes/+page.svelte' : `/src/routes${route}/+page.svelte`;
		loaders[filePath] = () => Promise.resolve({ breadcrumb: resolver });
	}
	return new LazyBreadcrumbMap(loaders);
}

describe('getResolversForRoute', () => {
	it('returns empty map for unmatched route', async () => {
		const map = buildTestMap([]);
		const result = await getResolversForRoute(map, '/unknown');
		expect(result.size).toBe(0);
	});

	it('includes root breadcrumb on child routes', async () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')]
		]);

		const result = await getResolversForRoute(map, '/products');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/', '/products']);
	});

	it('collects resolvers from root to leaf', async () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')],
			['/products/[id]/edit', makeResolver('Edit')]
		]);

		const result = await getResolversForRoute(map, '/products/42/edit');
		expect(result.size).toBe(4);
		expect([...result.keys()]).toEqual(['/', '/products', '/products/42', '/products/42/edit']);
	});

	it('skips missing intermediate segments', async () => {
		const map = buildTestMap([
			['/a', makeResolver('A')],
			['/a/b/c', makeResolver('C')]
		]);

		const result = await getResolversForRoute(map, '/a/b/c');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/a', '/a/b/c']);
	});

	it('handles root route', async () => {
		const map = buildTestMap([['/', makeResolver('Home')]]);

		const result = await getResolversForRoute(map, '/');
		expect(result.size).toBe(1);
		expect([...result.keys()]).toEqual(['/']);
	});

	it('does not duplicate root when visiting /', async () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')]
		]);

		const result = await getResolversForRoute(map, '/');
		expect(result.size).toBe(1);
		expect([...result.keys()]).toEqual(['/']);
	});

	it('preserves order: root first, then segments', async () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')]
		]);

		const result = await getResolversForRoute(map, '/products/99');
		expect([...result.keys()]).toEqual(['/', '/products', '/products/99']);
	});

	it('works without root breadcrumb defined', async () => {
		const map = buildTestMap([
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')]
		]);

		const result = await getResolversForRoute(map, '/products/42');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/products', '/products/42']);
	});
});
