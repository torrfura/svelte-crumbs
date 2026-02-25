import { describe, it, expect } from 'vitest';
import { getResolversForRoute } from './get-resolvers-for-route.js';
import { BreadcrumbLookup } from './build-breadcrumb-map.js';
import type { BreadcrumbResolver } from '../types.js';

const makeResolver = (label: string): BreadcrumbResolver => async () => ({ label });

/** Helper: builds a BreadcrumbLookup from route → resolver entries */
function buildTestMap(entries: [string, BreadcrumbResolver][]): BreadcrumbLookup {
	const resolvers = new Map<string, BreadcrumbResolver>();
	for (const [route, resolver] of entries) {
		resolvers.set(route, resolver);
	}
	return new BreadcrumbLookup(resolvers);
}

describe('getResolversForRoute', () => {
	it('returns empty map for unmatched route', () => {
		const map = buildTestMap([]);
		const result = getResolversForRoute(map, '/unknown');
		expect(result.size).toBe(0);
	});

	it('includes root breadcrumb on child routes', () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')]
		]);

		const result = getResolversForRoute(map, '/products');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/', '/products']);
	});

	it('collects resolvers from root to leaf', () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')],
			['/products/[id]/edit', makeResolver('Edit')]
		]);

		const result = getResolversForRoute(map, '/products/42/edit');
		expect(result.size).toBe(4);
		expect([...result.keys()]).toEqual(['/', '/products', '/products/42', '/products/42/edit']);
	});

	it('skips missing intermediate segments', () => {
		const map = buildTestMap([
			['/a', makeResolver('A')],
			['/a/b/c', makeResolver('C')]
		]);

		const result = getResolversForRoute(map, '/a/b/c');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/a', '/a/b/c']);
	});

	it('handles root route', () => {
		const map = buildTestMap([['/', makeResolver('Home')]]);

		const result = getResolversForRoute(map, '/');
		expect(result.size).toBe(1);
		expect([...result.keys()]).toEqual(['/']);
	});

	it('does not duplicate root when visiting /', () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')]
		]);

		const result = getResolversForRoute(map, '/');
		expect(result.size).toBe(1);
		expect([...result.keys()]).toEqual(['/']);
	});

	it('preserves order: root first, then segments', () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')]
		]);

		const result = getResolversForRoute(map, '/products/99');
		expect([...result.keys()]).toEqual(['/', '/products', '/products/99']);
	});

	it('works without root breadcrumb defined', () => {
		const map = buildTestMap([
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')]
		]);

		const result = getResolversForRoute(map, '/products/42');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/products', '/products/42']);
	});

	it('matches spread route with deep path', () => {
		const map = buildTestMap([
			['/', makeResolver('Home')],
			['/spread', makeResolver('Spread')],
			['/spread/[...operator]', makeResolver('Operator')]
		]);

		const result = getResolversForRoute(map, '/spread/users/42/settings');
		expect(result.size).toBe(5);
		expect([...result.keys()]).toEqual([
			'/',
			'/spread',
			'/spread/users',
			'/spread/users/42',
			'/spread/users/42/settings'
		]);
	});

	it('matches spread route with single segment', () => {
		const map = buildTestMap([
			['/spread', makeResolver('Spread')],
			['/spread/[...operator]', makeResolver('Operator')]
		]);

		const result = getResolversForRoute(map, '/spread/users');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/spread', '/spread/users']);
	});
});
