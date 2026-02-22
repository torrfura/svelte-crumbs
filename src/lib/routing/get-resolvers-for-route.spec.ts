import { describe, it, expect } from 'vitest';
import { getResolversForRoute } from './get-resolvers-for-route.js';
import type { BreadcrumbMap, BreadcrumbResolver } from '../types.js';

const makeResolver = (label: string): BreadcrumbResolver => async () => ({ label });

describe('getResolversForRoute', () => {
	it('returns empty map for unmatched route', () => {
		const map: BreadcrumbMap = new Map();
		const result = getResolversForRoute(map, '/unknown');
		expect(result.size).toBe(0);
	});

	it('includes root breadcrumb on child routes', () => {
		const map: BreadcrumbMap = new Map([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')]
		]);

		const result = getResolversForRoute(map, '/products');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/', '/products']);
	});

	it('collects resolvers from root to leaf', () => {
		const map: BreadcrumbMap = new Map([
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
		const map: BreadcrumbMap = new Map([
			['/a', makeResolver('A')],
			['/a/b/c', makeResolver('C')]
		]);

		const result = getResolversForRoute(map, '/a/b/c');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/a', '/a/b/c']);
	});

	it('handles root route', () => {
		const map: BreadcrumbMap = new Map([['/', makeResolver('Home')]]);

		const result = getResolversForRoute(map, '/');
		expect(result.size).toBe(1);
		expect([...result.keys()]).toEqual(['/']);
	});

	it('does not duplicate root when visiting /', () => {
		const map: BreadcrumbMap = new Map([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')]
		]);

		const result = getResolversForRoute(map, '/');
		expect(result.size).toBe(1);
		expect([...result.keys()]).toEqual(['/']);
	});

	it('preserves order: root first, then segments', () => {
		const map: BreadcrumbMap = new Map([
			['/', makeResolver('Home')],
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')]
		]);

		const result = getResolversForRoute(map, '/products/99');
		expect([...result.keys()]).toEqual(['/', '/products', '/products/99']);
	});

	it('works without root breadcrumb defined', () => {
		const map: BreadcrumbMap = new Map([
			['/products', makeResolver('Products')],
			['/products/[id]', makeResolver('Product')]
		]);

		const result = getResolversForRoute(map, '/products/42');
		expect(result.size).toBe(2);
		expect([...result.keys()]).toEqual(['/products', '/products/42']);
	});
});
