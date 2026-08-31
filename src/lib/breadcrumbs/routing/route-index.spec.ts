import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({ dev: false }));

import { RouteIndex, filePathToRouteId, stripGroups } from './route-index.js';
import type { BreadcrumbMeta, BreadcrumbResolver } from '../types.js';

const resolver =
	(label: string): BreadcrumbResolver =>
	async () => ({ label });

function loaderOf(meta: BreadcrumbMeta | undefined) {
	return vi.fn(async () => meta);
}

describe('filePathToRouteId', () => {
	it('strips the routes prefix and page suffix', () => {
		expect(filePathToRouteId('/src/routes/products/+page.svelte')).toBe('/products');
	});

	it('maps the root page to /', () => {
		expect(filePathToRouteId('/src/routes/+page.svelte')).toBe('/');
	});

	it('strips layout-breaking suffixes', () => {
		expect(filePathToRouteId('/src/routes/products/+page@admin.svelte')).toBe('/products');
		expect(filePathToRouteId('/src/routes/products/+page@.svelte')).toBe('/products');
	});

	it('strips group segments', () => {
		expect(filePathToRouteId('/src/routes/(marketing)/about/+page.svelte')).toBe('/about');
	});

	it('honours a custom routes prefix', () => {
		expect(filePathToRouteId('/src/app/routes/x/+page.svelte', '/src/app/routes')).toBe('/x');
	});

	it('keeps param and rest segments verbatim', () => {
		expect(filePathToRouteId('/src/routes/docs/[...slug]/+page.svelte')).toBe('/docs/[...slug]');
		expect(filePathToRouteId('/src/routes/[[lang]]/about/+page.svelte')).toBe('/[[lang]]/about');
	});
});

describe('stripGroups', () => {
	it('removes group segments from route ids', () => {
		expect(stripGroups('/(app)/products/[id]')).toBe('/products/[id]');
	});

	it('maps a group-only id to /', () => {
		expect(stripGroups('/(app)')).toBe('/');
	});

	it('leaves group-free ids untouched', () => {
		expect(stripGroups('/products/[id]')).toBe('/products/[id]');
	});
});

describe('RouteIndex', () => {
	it('builds route ids synchronously without calling any loader', () => {
		const home = loaderOf(resolver('Home'));
		const products = loaderOf(resolver('Products'));
		new RouteIndex({
			'/src/routes/+page.svelte': home,
			'/src/routes/products/+page.svelte': products
		});
		expect(home).not.toHaveBeenCalled();
		expect(products).not.toHaveBeenCalled();
	});

	it('loads only the requested route ids', async () => {
		const home = loaderOf(resolver('Home'));
		const products = loaderOf(resolver('Products'));
		const about = loaderOf(resolver('About'));
		const index = new RouteIndex({
			'/src/routes/+page.svelte': home,
			'/src/routes/products/+page.svelte': products,
			'/src/routes/about/+page.svelte': about
		});

		await index.ensureLoaded(['/', '/products']);

		expect(home).toHaveBeenCalledOnce();
		expect(products).toHaveBeenCalledOnce();
		expect(about).not.toHaveBeenCalled();
		expect(index.resolvers.has('/')).toBe(true);
		expect(index.resolvers.has('/products')).toBe(true);
		expect(index.resolvers.has('/about')).toBe(false);
	});

	it('loads every module when called without route ids (eager)', async () => {
		const home = loaderOf(resolver('Home'));
		const about = loaderOf(resolver('About'));
		const index = new RouteIndex({
			'/src/routes/+page.svelte': home,
			'/src/routes/about/+page.svelte': about
		});

		await index.ensureLoaded();

		expect(home).toHaveBeenCalledOnce();
		expect(about).toHaveBeenCalledOnce();
	});

	it('loads each module at most once across calls', async () => {
		const products = loaderOf(resolver('Products'));
		const index = new RouteIndex({ '/src/routes/products/+page.svelte': products });

		await index.ensureLoaded(['/products']);
		await index.ensureLoaded(['/products']);
		await index.ensureLoaded();

		expect(products).toHaveBeenCalledOnce();
	});

	it('ignores route ids with no matching module', async () => {
		const index = new RouteIndex({});
		await expect(index.ensureLoaded(['/missing'])).resolves.toBeUndefined();
	});

	it('skips modules without a breadcrumb export', async () => {
		const index = new RouteIndex({ '/src/routes/about/+page.svelte': loaderOf(undefined) });
		await index.ensureLoaded(['/about']);
		expect(index.resolvers.size).toBe(0);
	});

	it('registers { routes } entries under normalized keys', async () => {
		const spread = resolver('Spread');
		const index = new RouteIndex({
			'/src/routes/spread/[...operator]/+page.svelte': loaderOf({
				routes: {
					'/spread': spread,
					'spread/[...operator]/': resolver('Segment'),
					'/(group)/extra': resolver('Extra')
				}
			})
		});

		await index.ensureLoaded(['/spread/[...operator]']);

		expect(index.resolvers.get('/spread')).toBe(spread);
		expect(index.resolvers.has('/spread/[...operator]')).toBe(true);
		expect(index.resolvers.has('/extra')).toBe(true);
	});

	it('isolates a throwing loader and keeps the rest', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const good = loaderOf(resolver('Good'));
		const index = new RouteIndex({
			'/src/routes/bad/+page.svelte': vi.fn(async () => {
				throw new Error('load exploded');
			}),
			'/src/routes/good/+page.svelte': good
		});

		await index.ensureLoaded(['/bad', '/good']);

		expect(index.resolvers.has('/good')).toBe(true);
		expect(index.resolvers.has('/bad')).toBe(false);
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});
