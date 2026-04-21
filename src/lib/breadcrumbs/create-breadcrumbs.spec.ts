import { describe, it, expect, vi } from 'vitest';
import { createBreadcrumbs } from './create-breadcrumbs.svelte.js';
import * as getResolvers from './routing/get-resolvers-for-route.js';

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
