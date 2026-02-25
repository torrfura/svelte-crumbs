import { describe, it, expect } from 'vitest';
import { BreadcrumbLookup } from './build-breadcrumb-map.js';
import type { BreadcrumbResolver } from '../types.js';

const makeResolver = (label: string): BreadcrumbResolver => async () => ({ label });

function buildLookup(entries: [string, BreadcrumbResolver][]): BreadcrumbLookup {
	return new BreadcrumbLookup(new Map(entries));
}

describe('BreadcrumbLookup', () => {
	it('returns exact match', () => {
		const resolver = makeResolver('Products');
		const lookup = buildLookup([['/products', resolver]]);
		expect(lookup.get('/products')).toBe(resolver);
	});

	it('returns undefined for unknown route', () => {
		const lookup = buildLookup([['/products', makeResolver('Products')]]);
		expect(lookup.get('/unknown')).toBeUndefined();
	});

	it('matches dynamic [param] segment', () => {
		const resolver = makeResolver('Product');
		const lookup = buildLookup([['/products/[id]', resolver]]);
		expect(lookup.get('/products/42')).toBe(resolver);
	});

	it('matches [...spread] route', () => {
		const resolver = makeResolver('Catch-all');
		const lookup = buildLookup([['/docs/[...slug]', resolver]]);
		expect(lookup.get('/docs/a/b/c')).toBe(resolver);
	});

	it('prefers exact match over dynamic pattern', () => {
		const exact = makeResolver('Exact');
		const dynamic = makeResolver('Dynamic');
		const lookup = buildLookup([
			['/products/[id]', dynamic],
			['/products/featured', exact]
		]);
		expect(lookup.get('/products/featured')).toBe(exact);
	});

	it('skips non-dynamic patterns during fallback scan', () => {
		const lookup = buildLookup([
			['/products', makeResolver('Products')],
			['/about', makeResolver('About')]
		]);
		expect(lookup.get('/contact')).toBeUndefined();
	});
});
