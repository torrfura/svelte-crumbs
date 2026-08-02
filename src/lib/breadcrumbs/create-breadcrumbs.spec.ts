import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBreadcrumbs } from './create-breadcrumbs.svelte.js';
import * as getResolvers from './routing/get-resolvers-for-route.js';
import type { BreadcrumbPage, BreadcrumbResolver, PathTransform } from './types.js';

const { pageMock } = vi.hoisted(() => ({
	pageMock: {
		url: new URL('http://localhost/test'),
		params: {},
		route: { id: '/test' },
		data: {}
	}
}));

vi.mock('$app/state', () => ({ page: pageMock }));

beforeEach(() => {
	pageMock.url = new URL('http://localhost/test');
});

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

describe('createBreadcrumbs transformPath', () => {
	/** Runs a breadcrumb pass and hands back the page snapshot the resolver saw. */
	async function snapshotFor(
		options?: Parameters<typeof createBreadcrumbs>[0]
	): Promise<BreadcrumbPage> {
		let seen: BreadcrumbPage | undefined;
		const resolver: BreadcrumbResolver = vi.fn(async (p) => {
			seen = p;
			return { label: 'Crumb' };
		});
		vi.mocked(getResolvers.getResolversForRoute).mockReturnValue(
			new Map<string, BreadcrumbResolver>([['/crumb', resolver]])
		);

		await createBreadcrumbs(options)();
		return seen as BreadcrumbPage;
	}

	it('leaves the pathname untouched when no transform is given', async () => {
		pageMock.url = new URL('http://localhost/nl/products?page=2#top');

		const snap = await snapshotFor();

		expect(vi.mocked(getResolvers.getResolversForRoute).mock.lastCall?.[1]).toBe('/nl/products');
		expect(snap.url.href).toBe('http://localhost/nl/products?page=2#top');
	});

	it('matches routes against the transformed path', async () => {
		pageMock.url = new URL('http://localhost/nl/products/42');

		await snapshotFor({ transformPath: ({ pathname }) => pathname.replace(/^\/nl/, '') });

		expect(vi.mocked(getResolvers.getResolversForRoute).mock.lastCall?.[1]).toBe('/products/42');
	});

	it('reflects the transformed path in the snapshot url, href, and search', async () => {
		pageMock.url = new URL('http://localhost/nl/products?page=2#top');

		const snap = await snapshotFor({
			transformPath: ({ pathname }) => pathname.replace(/^\/nl/, '')
		});

		expect(snap.url.pathname).toBe('/products');
		expect(snap.url.href).toBe('http://localhost/products?page=2#top');
		expect(snap.url.search).toBe('?page=2');
		expect(snap.url.hash).toBe('#top');
		// The live page object must not be mutated.
		expect(pageMock.url.pathname).toBe('/nl/products');
	});

	it('receives the untransformed pathname and full url', async () => {
		pageMock.url = new URL('http://localhost/nl/products?locale=nl');
		const transformPath = vi.fn<PathTransform>(({ pathname }) => pathname.replace(/^\/nl/, ''));

		await snapshotFor({ transformPath });

		expect(transformPath).toHaveBeenCalledWith({
			pathname: '/nl/products',
			url: expect.any(URL)
		});
		expect(transformPath.mock.lastCall?.[0].url.href).toBe(
			'http://localhost/nl/products?locale=nl'
		);
	});

	it('normalises a result that is missing its leading slash', async () => {
		pageMock.url = new URL('http://localhost/nl/products');

		const snap = await snapshotFor({ transformPath: () => 'products' });

		expect(vi.mocked(getResolvers.getResolversForRoute).mock.lastCall?.[1]).toBe('/products');
		expect(snap.url.pathname).toBe('/products');
	});

	it('treats an empty result as the root path', async () => {
		pageMock.url = new URL('http://localhost/nl');

		const snap = await snapshotFor({ transformPath: () => '' });

		expect(vi.mocked(getResolvers.getResolversForRoute).mock.lastCall?.[1]).toBe('/');
		expect(snap.url.pathname).toBe('/');
	});

	it('falls back to the raw pathname when the transform throws', async () => {
		pageMock.url = new URL('http://localhost/nl/products');
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const snap = await snapshotFor({
			transformPath: () => {
				throw new Error('transform exploded');
			}
		});

		expect(vi.mocked(getResolvers.getResolversForRoute).mock.lastCall?.[1]).toBe('/nl/products');
		expect(snap.url.href).toBe('http://localhost/nl/products');
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});
