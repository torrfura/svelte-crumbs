import { describe, it, expect, vi } from 'vitest';
import { createBreadcrumbs } from './create-breadcrumbs.svelte.js';
import * as getResolvers from './routing/get-resolvers-for-route.js';
import type { BreadcrumbResolver } from './types.js';

vi.mock('$app/state', () => ({
	page: {
		url: { pathname: '/test', href: 'http://localhost/test' },
		params: {},
		route: { id: '/test' },
		data: {}
	}
}));

vi.mock('./routing/build-breadcrumb-map.js', () => ({
	buildBreadcrumbMap: vi.fn(() => ({
		ready: Promise.resolve(),
		lookup: {}
	}))
}));

vi.mock('./routing/get-resolvers-for-route.js', () => ({
	getResolversForRoute: vi.fn(() => new Map())
}));

describe('createBreadcrumbs reactivity preservation', () => {
	it('calls resolver synchronously when already loaded', async () => {
		const resolver = vi.fn(async () => ({ label: 'Test' }));
		const resolversMap = new Map([['/test', resolver]]);

		vi.mocked(getResolvers.getResolversForRoute).mockReturnValue(resolversMap);

		const getBreadcrumbs = createBreadcrumbs();

		// First call to load it
		await getBreadcrumbs();
		expect(resolver).toHaveBeenCalled();
		resolver.mockClear();

		// Second call - should be synchronous until the resolver is called
		let resolverCalledSync = false;
		resolver.mockImplementation(() => {
			resolverCalledSync = true;
			return Promise.resolve({ label: 'Test' });
		});

		const promise = getBreadcrumbs();
		expect(resolverCalledSync).toBe(true);
		await promise;
	});
});

describe('createBreadcrumbs resolver behavior', () => {
	it('isolates a throwing resolver — other crumbs still resolve', async () => {
		const good: BreadcrumbResolver = vi.fn(async () => ({ label: 'Good' }));
		const bad: BreadcrumbResolver = vi.fn(async () => {
			throw new Error('resolver exploded');
		});
		vi.mocked(getResolvers.getResolversForRoute).mockReturnValue(
			new Map<string, BreadcrumbResolver>([
				['/good', good],
				['/bad', bad]
			])
		);

		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const result = await createBreadcrumbs()();

		expect(result).toEqual([{ url: '/good', label: 'Good' }]);
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it('filters out resolvers that return undefined', async () => {
		const labeled: BreadcrumbResolver = vi.fn(async () => ({ label: 'Visible' }));
		const skipped: BreadcrumbResolver = vi.fn(async () => undefined);
		vi.mocked(getResolvers.getResolversForRoute).mockReturnValue(
			new Map<string, BreadcrumbResolver>([
				['/visible', labeled],
				['/skipped', skipped]
			])
		);

		const result = await createBreadcrumbs()();

		expect(result).toEqual([{ url: '/visible', label: 'Visible' }]);
	});

	it('returns an empty array when no resolvers match the route', async () => {
		vi.mocked(getResolvers.getResolversForRoute).mockReturnValue(new Map());

		const result = await createBreadcrumbs()();

		expect(result).toEqual([]);
	});
});
