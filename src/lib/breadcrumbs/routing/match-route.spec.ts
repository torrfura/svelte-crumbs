import { describe, it, expect } from 'vitest';
import { filePathToRoute, matchDynamicRoute } from './match-route.js';
import type { BreadcrumbMap, BreadcrumbResolver } from '../types.js';

const dummyResolver: BreadcrumbResolver = async () => ({ label: 'test' });

describe('filePathToRoute', () => {
	it('converts basic path', () => {
		expect(filePathToRoute('/src/routes/products/+page.svelte')).toBe('/products');
	});

	it('strips route groups', () => {
		expect(filePathToRoute('/src/routes/(app)/products/+page.svelte')).toBe('/products');
	});

	it('strips nested route groups', () => {
		expect(filePathToRoute('/src/routes/(app)/(admin)/users/+page.svelte')).toBe('/users');
	});

	it('handles root route', () => {
		expect(filePathToRoute('/src/routes/+page.svelte')).toBe('/');
	});

	it('preserves dynamic segments', () => {
		expect(filePathToRoute('/src/routes/products/[id]/+page.svelte')).toBe('/products/[id]');
	});

	it('handles deeply nested paths', () => {
		expect(filePathToRoute('/src/routes/a/b/c/d/+page.svelte')).toBe('/a/b/c/d');
	});
});

describe('matchDynamicRoute', () => {
	it('matches static route exactly', () => {
		const map: BreadcrumbMap = new Map([['/products', dummyResolver]]);
		expect(matchDynamicRoute(map, '/products')).toBe(dummyResolver);
	});

	it('matches dynamic segment', () => {
		const map: BreadcrumbMap = new Map([['/products/[id]', dummyResolver]]);
		expect(matchDynamicRoute(map, '/products/42')).toBe(dummyResolver);
	});

	it('returns undefined for segment count mismatch', () => {
		const map: BreadcrumbMap = new Map([['/products/[id]', dummyResolver]]);
		expect(matchDynamicRoute(map, '/products')).toBeUndefined();
	});

	it('returns undefined for no match', () => {
		const map: BreadcrumbMap = new Map([['/users/[id]', dummyResolver]]);
		expect(matchDynamicRoute(map, '/products/42')).toBeUndefined();
	});

	it('matches multiple dynamic segments', () => {
		const map: BreadcrumbMap = new Map([['/org/[orgId]/project/[projectId]', dummyResolver]]);
		expect(matchDynamicRoute(map, '/org/abc/project/xyz')).toBe(dummyResolver);
	});

	it('returns first match when multiple patterns exist', () => {
		const resolver2: BreadcrumbResolver = async () => ({ label: 'second' });
		const map: BreadcrumbMap = new Map([
			['/products/[id]', dummyResolver],
			['/products/[slug]', resolver2]
		]);
		expect(matchDynamicRoute(map, '/products/42')).toBe(dummyResolver);
	});
});
