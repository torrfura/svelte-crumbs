import { describe, it, expect } from 'vitest';
import { filePathToRoute, matchDynamicRoutePattern } from './match-route.js';

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

	it('strips mid-path route groups', () => {
		expect(filePathToRoute('/src/routes/settings/(tabs)/profile/+page.svelte')).toBe(
			'/settings/profile'
		);
	});

	it('handles root route', () => {
		expect(filePathToRoute('/src/routes/+page.svelte')).toBe('/');
	});

	it('preserves dynamic segments', () => {
		expect(filePathToRoute('/src/routes/products/[id]/+page.svelte')).toBe('/products/[id]');
	});

	it('preserves deeply nested dynamic segments', () => {
		expect(filePathToRoute('/src/routes/users/[userId]/posts/[postId]/+page.svelte')).toBe(
			'/users/[userId]/posts/[postId]'
		);
	});

	it('handles deeply nested paths', () => {
		expect(filePathToRoute('/src/routes/a/b/c/d/+page.svelte')).toBe('/a/b/c/d');
	});

	it('handles layout reset +page@.svelte', () => {
		expect(filePathToRoute('/src/routes/products/+page@.svelte')).toBe('/products');
	});

	it('handles named layout reset +page@layout.svelte', () => {
		expect(filePathToRoute('/src/routes/products/+page@admin.svelte')).toBe('/products');
	});
});

describe('matchDynamicRoutePattern', () => {
	it('matches static route exactly', () => {
		expect(matchDynamicRoutePattern('/products', '/products')).toBe(true);
	});

	it('matches dynamic segment', () => {
		expect(matchDynamicRoutePattern('/products/[id]', '/products/42')).toBe(true);
	});

	it('matches multiple dynamic segments', () => {
		expect(
			matchDynamicRoutePattern('/org/[orgId]/project/[projectId]', '/org/abc/project/xyz')
		).toBe(true);
	});

	it('returns false for segment count mismatch', () => {
		expect(matchDynamicRoutePattern('/products/[id]', '/products')).toBe(false);
	});

	it('returns false for no match', () => {
		expect(matchDynamicRoutePattern('/users/[id]', '/products/42')).toBe(false);
	});

	it('matches spread route with single segment', () => {
		expect(matchDynamicRoutePattern('/spread/[...rest]', '/spread/users')).toBe(true);
	});

	it('matches spread route with multiple segments', () => {
		expect(matchDynamicRoutePattern('/spread/[...rest]', '/spread/users/42/settings')).toBe(
			true
		);
	});

	it('returns false when spread has no remaining segments', () => {
		expect(matchDynamicRoutePattern('/spread/[...rest]', '/spread')).toBe(false);
	});

	it('returns false when spread prefix does not match', () => {
		expect(matchDynamicRoutePattern('/spread/[...rest]', '/other/users')).toBe(false);
	});
});
