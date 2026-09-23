import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getCrumbs, createBreadcrumbs } from './get-crumbs.js';
import { getRouteIndex } from './routing/route-index.svelte.js';
import type { BreadcrumbMeta, BreadcrumbPage, BreadcrumbResolver, PathTransform } from './types.js';

const { pageMock, pathsMock, envMock } = vi.hoisted(() => ({
	envMock: { dev: false, browser: false },
	pageMock: {
		url: new URL('http://localhost/'),
		params: {} as Record<string, string>,
		route: { id: '/' as string | null },
		data: {} as Record<string, unknown>
	},
	pathsMock: { base: '', hashRouting: false }
}));

vi.mock('$app/env', () => envMock);
vi.mock('$app/state', () => ({ page: pageMock }));
// Mirrors kit's own resolve: `base + (hashRouting ? '#' : '') + path`, with
// groups dropped and dynamic segments filled from `params`.
vi.mock('$app/paths', () => ({
	resolve(path: string, params: Record<string, string | undefined> = {}) {
		const filled = path
			.split('/')
			.filter((seg) => !/^\(.*\)$/.test(seg))
			.map((seg) => {
				const m = /^\[{1,2}(?:\.\.\.)?([^\]=]+)(?:=[^\]]+)?\]{1,2}$/.exec(seg);
				return m ? (params[m[1]] ?? '') : seg;
			})
			.filter((seg, i) => i === 0 || seg !== '')
			.join('/');
		return pathsMock.base + (pathsMock.hashRouting ? '#' : '') + (filled || '/');
	}
}));

beforeEach(() => {
	pageMock.url = new URL('http://localhost/');
	pageMock.params = {};
	pageMock.route = { id: '/' };
	pageMock.data = {};
	pathsMock.base = '';
	pathsMock.hashRouting = false;
	envMock.browser = false;
});

type ModuleLoaderMock = Mock<() => Promise<BreadcrumbMeta | undefined>>;

/** Builds a fresh modules record — each record gets its own memoized RouteIndex. */
function modulesOf(metas: Record<string, BreadcrumbMeta>) {
	const modules: Record<string, ModuleLoaderMock> = {};
	for (const [route, meta] of Object.entries(metas)) {
		const dir = route === '/' ? '' : route;
		modules[`/src/routes${dir}/+page.svelte`] = vi.fn(async () => meta);
	}
	return modules;
}

function visit(routeId: string | null, pathname: string, params: Record<string, string> = {}) {
	pageMock.url = new URL(`http://localhost${pathname}`);
	pageMock.route = { id: routeId };
	pageMock.params = params;
}

describe('getCrumbs trail resolution', () => {
	it('resolves the full trail for a nested dynamic route', async () => {
		const modules = modulesOf({
			'/': async () => ({ label: 'Home' }),
			'/products': async () => ({ label: 'Products' }),
			'/products/[id]': async (page) => ({
				label: `#${(page.params as Record<string, string | undefined>).id}`
			})
		});
		visit('/products/[id]', '/products/42', { id: '42' });

		const crumbs = await getCrumbs({ modules });

		expect(crumbs).toEqual([
			{ label: 'Home', url: '/' },
			{ label: 'Products', url: '/products' },
			{ label: '#42', url: '/products/42' }
		]);
	});

	it('loads only modules along the current path', async () => {
		const modules = modulesOf({
			'/products': async () => ({ label: 'Products' }),
			'/about': async () => ({ label: 'About' })
		});
		visit('/products', '/products');

		await getCrumbs({ modules });

		expect(modules['/src/routes/products/+page.svelte']).toHaveBeenCalledOnce();
		expect(modules['/src/routes/about/+page.svelte']).not.toHaveBeenCalled();
	});

	it('loads every module when eager is set', async () => {
		const modules = modulesOf({
			'/products': async () => ({ label: 'Products' }),
			'/about': async () => ({ label: 'About' })
		});
		visit('/products', '/products');

		await getCrumbs({ modules, eager: true });

		expect(modules['/src/routes/about/+page.svelte']).toHaveBeenCalledOnce();
	});

	it('finds { routes } keys registered by the leaf module for ancestor levels', async () => {
		const modules = modulesOf({
			'/spread/[...operator]': {
				routes: {
					'/spread': async () => ({ label: 'Spread' }),
					'/spread/[...operator]': async (_page, url) => ({
						label: url.split('/').pop() ?? ''
					})
				}
			}
		});
		visit('/spread/[...operator]', '/spread/users/42', { operator: 'users/42' });

		const crumbs = await getCrumbs({ modules });

		expect(crumbs).toEqual([
			{ label: 'Spread', url: '/spread' },
			{ label: 'users', url: '/spread/users' },
			{ label: '42', url: '/spread/users/42' }
		]);
	});

	it('resolves a crumb when a rest route matched zero segments', async () => {
		const modules = modulesOf({
			'/spread/[...operator]': {
				routes: { '/spread': async () => ({ label: 'Spread' }) }
			}
		});
		visit('/spread/[...operator]', '/spread', { operator: '' });

		const crumbs = await getCrumbs({ modules });

		expect(crumbs).toEqual([{ label: 'Spread', url: '/spread' }]);
	});

	it('resolves optional-param routes with and without the param', async () => {
		const modules = modulesOf({
			'/[[lang]]/about': async (page) => ({
				label: (page.params as Record<string, string | undefined>).lang ?? 'default'
			})
		});

		visit('/[[lang]]/about', '/en/about', { lang: 'en' });
		expect(await getCrumbs({ modules })).toEqual([{ label: 'en', url: '/en/about' }]);

		visit('/[[lang]]/about', '/about');
		expect(await getCrumbs({ modules })).toEqual([{ label: 'default', url: '/about' }]);
	});

	it('strips group segments from the matched route id', async () => {
		const about: BreadcrumbMeta = async () => ({ label: 'About' });
		const modules = { '/src/routes/(marketing)/about/+page.svelte': vi.fn(async () => about) };
		visit('/(marketing)/about', '/about');

		expect(await getCrumbs({ modules })).toEqual([{ label: 'About', url: '/about' }]);
	});

	it('returns an empty trail when no route matched', async () => {
		const modules = modulesOf({ '/': async () => ({ label: 'Home' }) });
		visit(null, '/nonexistent');

		expect(await getCrumbs({ modules })).toEqual([]);
	});

	it('returns an empty array when no resolvers match', async () => {
		visit('/orphan', '/orphan');
		expect(await getCrumbs({ modules: {} })).toEqual([]);
	});
});

describe('getCrumbs resolver behavior', () => {
	it('isolates a throwing resolver — other crumbs still resolve', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const modules = modulesOf({
			'/': async () => ({ label: 'Home' }),
			'/bad': async () => {
				throw new Error('resolver exploded');
			}
		});
		visit('/bad', '/bad');

		const crumbs = await getCrumbs({ modules });

		expect(crumbs).toEqual([{ label: 'Home', url: '/' }]);
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it('filters out resolvers that return undefined', async () => {
		const modules = modulesOf({
			'/': async () => ({ label: 'Home' }),
			'/hidden': async () => undefined
		});
		visit('/hidden', '/hidden');

		expect(await getCrumbs({ modules })).toEqual([{ label: 'Home', url: '/' }]);
	});

	it('passes the page snapshot and crumb url to resolvers', async () => {
		let seen: BreadcrumbPage | undefined;
		let seenUrl: string | undefined;
		const resolver: BreadcrumbResolver = async (page, url) => {
			seen = page;
			seenUrl = url;
			return { label: 'X' };
		};
		const modules = modulesOf({ '/products': resolver });
		visit('/products', '/products');
		pageMock.data = { answer: 42 };

		await getCrumbs({ modules });

		expect(seenUrl).toBe('/products');
		expect(seen?.data).toEqual({ answer: 42 });
		expect(seen?.route.id).toBe('/products');
		// Snapshot, not the live object.
		expect(seen?.url).not.toBe(pageMock.url);
		expect(seen?.url.href).toBe('http://localhost/products');
	});
});

describe('getCrumbs base path handling', () => {
	it('matches base-prefixed pathnames and prefixes crumb urls with base', async () => {
		pathsMock.base = '/app';
		const modules = modulesOf({
			'/': async () => ({ label: 'Home' }),
			'/products': async () => ({ label: 'Products' })
		});
		visit('/products', '/app/products');

		const crumbs = await getCrumbs({ modules });

		expect(crumbs).toEqual([
			{ label: 'Home', url: '/app/' },
			{ label: 'Products', url: '/app/products' }
		]);
	});

	it('does not mistake the hash-routing marker for part of the base path', async () => {
		pathsMock.base = '/app';
		pathsMock.hashRouting = true;
		const modules = modulesOf({
			'/': async () => ({ label: 'Home' }),
			'/products': async () => ({ label: 'Products' })
		});
		visit('/products', '/app/products');

		const crumbs = await getCrumbs({ modules });

		expect(crumbs).toEqual([
			{ label: 'Home', url: '/app#/' },
			{ label: 'Products', url: '/app#/products' }
		]);
	});
});

describe('getCrumbs transformPath', () => {
	it('matches routes against the transformed path', async () => {
		const modules = modulesOf({
			'/products': async () => ({ label: 'Products' }),
			'/products/[id]': async () => ({ label: 'Detail' })
		});
		visit('/products/[id]', '/nl/products/42', { id: '42' });

		const crumbs = await getCrumbs({
			modules,
			transformPath: ({ pathname }) => pathname.replace(/^\/nl/, '')
		});

		expect(crumbs).toEqual([
			{ label: 'Products', url: '/products' },
			{ label: 'Detail', url: '/products/42' }
		]);
	});

	it('reflects the transformed path in the snapshot url, preserving search and hash', async () => {
		let seen: BreadcrumbPage | undefined;
		const modules = modulesOf({
			'/products': async (page) => {
				seen = page;
				return { label: 'Products' };
			}
		});
		visit('/products', '/nl/products');
		pageMock.url = new URL('http://localhost/nl/products?page=2#top');

		await getCrumbs({ modules, transformPath: ({ pathname }) => pathname.replace(/^\/nl/, '') });

		expect(seen?.url.pathname).toBe('/products');
		expect(seen?.url.href).toBe('http://localhost/products?page=2#top');
		expect(seen?.url.search).toBe('?page=2');
		expect(seen?.url.hash).toBe('#top');
		// The live page object must not be mutated.
		expect(pageMock.url.pathname).toBe('/nl/products');
	});

	it('receives the untransformed pathname and full url', async () => {
		const transformPath = vi.fn<PathTransform>(({ pathname }) => pathname.replace(/^\/nl/, ''));
		const modules = modulesOf({ '/products': async () => ({ label: 'Products' }) });
		visit('/products', '/nl/products');
		pageMock.url = new URL('http://localhost/nl/products?locale=nl');

		await getCrumbs({ modules, transformPath });

		expect(transformPath).toHaveBeenCalledWith({ pathname: '/nl/products', url: expect.any(URL) });
		expect(transformPath.mock.lastCall?.[0].url.href).toBe(
			'http://localhost/nl/products?locale=nl'
		);
	});

	it('normalises a result that is missing its leading slash', async () => {
		const modules = modulesOf({ '/products': async () => ({ label: 'Products' }) });
		visit('/products', '/nl/products');

		const crumbs = await getCrumbs({ modules, transformPath: () => 'products' });

		expect(crumbs).toEqual([{ label: 'Products', url: '/products' }]);
	});

	it('treats an empty result as the root path', async () => {
		const modules = modulesOf({ '/': async () => ({ label: 'Home' }) });
		visit('/', '/nl');

		const crumbs = await getCrumbs({ modules, transformPath: () => '' });

		expect(crumbs).toEqual([{ label: 'Home', url: '/' }]);
	});

	it('falls back to the raw pathname when the transform throws', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const modules = modulesOf({ '/products': async () => ({ label: 'Products' }) });
		visit('/products', '/products');

		const crumbs = await getCrumbs({
			modules,
			transformPath: () => {
				throw new Error('transform exploded');
			}
		});

		expect(crumbs).toEqual([{ label: 'Products', url: '/products' }]);
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});

describe('getCrumbs route option', () => {
	it("walks the given route instead of the current page's", async () => {
		const modules = modulesOf({
			'/': async () => ({ label: 'Home' }),
			'/products': async () => ({ label: 'Products' }),
			'/products/[productId]': async (page) => ({ label: `Product ${page.params.productId}` })
		});
		visit('/about', '/about');

		const crumbs = await getCrumbs({
			modules,
			route: { id: '/(app)/products/[productId]', params: { productId: '7' } }
		});

		expect(crumbs).toEqual([
			{ label: 'Home', url: '/' },
			{ label: 'Products', url: '/products' },
			{ label: 'Product 7', url: '/products/7' }
		]);
	});

	it('passes the given route id and params to resolvers', async () => {
		let seen: BreadcrumbPage | undefined;
		const modules = modulesOf({
			'/products/[productId]': async (page) => {
				seen = page;
				return { label: 'X' };
			}
		});
		visit('/about', '/about', { lang: 'en' });

		await getCrumbs({
			modules,
			route: { id: '/products/[productId]', params: { productId: '7' } }
		});

		expect(seen?.route.id).toBe('/products/[productId]');
		expect(seen?.params).toEqual({ productId: '7' });
		expect(seen?.url.pathname).toBe('/products/7');
	});

	it('strips the base path and ignores transformPath', async () => {
		pathsMock.base = '/app';
		const transformPath = vi.fn<PathTransform>(() => '/elsewhere');
		const modules = modulesOf({ '/products': async () => ({ label: 'Products' }) });
		visit('/about', '/app/about');

		const crumbs = await getCrumbs({ modules, transformPath, route: { id: '/products' } });

		expect(crumbs).toEqual([{ label: 'Products', url: '/app/products' }]);
		expect(transformPath).not.toHaveBeenCalled();
	});
});

describe('getCrumbs warmup', () => {
	/** Waits past the idle fallback timeout used outside browsers. */
	const afterIdle = () => new Promise((r) => setTimeout(r, 400));

	function setup() {
		envMock.browser = true;
		const modules = modulesOf({
			'/products': async () => ({ label: 'Products' }),
			'/about': async () => ({ label: 'About' })
		});
		visit('/products', '/products');
		return modules;
	}

	it('loads every route in the background by default, then re-runs once', async () => {
		const modules = setup();
		const index = getRouteIndex(modules);

		await getCrumbs({ modules });
		expect(modules['/src/routes/about/+page.svelte']).not.toHaveBeenCalled();
		await afterIdle();

		expect(modules['/src/routes/about/+page.svelte']).toHaveBeenCalledOnce();
		// Same as 2.0.x: one bump after the warmup, none per cold load.
		expect(index.version).toBe(1);
	});

	it("loads only visited routes with warmup: 'visited'", async () => {
		const modules = setup();
		const index = getRouteIndex(modules);

		await getCrumbs({ modules, warmup: 'visited' });
		await afterIdle();

		expect(modules['/src/routes/about/+page.svelte']).not.toHaveBeenCalled();
		// The cold load still re-runs consumers once, so resolver reads get tracked.
		expect(index.version).toBe(1);
	});

	it('never warms up on the server', async () => {
		const modules = setup();
		envMock.browser = false;

		await getCrumbs({ modules, warmup: 'all' });
		await afterIdle();

		expect(modules['/src/routes/about/+page.svelte']).not.toHaveBeenCalled();
	});
});

describe('createBreadcrumbs (deprecated shim)', () => {
	it('returns a getter equivalent to getCrumbs', async () => {
		const modules = modulesOf({ '/products': async () => ({ label: 'Products' }) });
		visit('/products', '/products');

		const getBreadcrumbs = createBreadcrumbs({ modules });

		expect(await getBreadcrumbs()).toEqual([{ label: 'Products', url: '/products' }]);
	});
});
