import { describe, it, expect } from 'vitest';
import { walkRoute } from './route-walk.js';

describe('walkRoute', () => {
	it('always emits the root level', () => {
		expect(walkRoute('/', '/', {})).toEqual([{ routeId: '/', url: '/' }]);
	});

	it('walks static segments one-to-one', () => {
		expect(walkRoute('/products/list', '/products/list', {})).toEqual([
			{ routeId: '/', url: '/' },
			{ routeId: '/products', url: '/products' },
			{ routeId: '/products/list', url: '/products/list' }
		]);
	});

	it('walks dynamic params against concrete segments', () => {
		expect(walkRoute('/products/[id]/edit', '/products/42/edit', { id: '42' })).toEqual([
			{ routeId: '/', url: '/' },
			{ routeId: '/products', url: '/products' },
			{ routeId: '/products/[id]', url: '/products/42' },
			{ routeId: '/products/[id]/edit', url: '/products/42/edit' }
		]);
	});

	it('treats matcher params as single-segment consumers', () => {
		expect(walkRoute('/items/[id=integer]', '/items/7', { id: '7' })).toEqual([
			{ routeId: '/', url: '/' },
			{ routeId: '/items', url: '/items' },
			{ routeId: '/items/[id=integer]', url: '/items/7' }
		]);
	});

	it('treats compound segments as single-segment consumers', () => {
		expect(walkRoute('/foo-[c]', '/foo-def', { c: 'def' })).toEqual([
			{ routeId: '/', url: '/' },
			{ routeId: '/foo-[c]', url: '/foo-def' }
		]);
	});

	describe('optional params', () => {
		it('consumes a segment when the param is present', () => {
			expect(walkRoute('/[[lang]]/about', '/en/about', { lang: 'en' })).toEqual([
				{ routeId: '/', url: '/' },
				{ routeId: '/[[lang]]', url: '/en' },
				{ routeId: '/[[lang]]/about', url: '/en/about' }
			]);
		});

		it('consumes nothing when the param is absent', () => {
			expect(walkRoute('/[[lang]]/about', '/about', {})).toEqual([
				{ routeId: '/', url: '/' },
				{ routeId: '/[[lang]]', url: '/' },
				{ routeId: '/[[lang]]/about', url: '/about' }
			]);
		});

		it('handles optional params with matchers', () => {
			expect(walkRoute('/[[lang=locale]]/about', '/about', {})).toEqual([
				{ routeId: '/', url: '/' },
				{ routeId: '/[[lang=locale]]', url: '/' },
				{ routeId: '/[[lang=locale]]/about', url: '/about' }
			]);
		});
	});

	describe('rest params', () => {
		it('emits one level per consumed segment by default', () => {
			expect(walkRoute('/docs/[...slug]', '/docs/a/b', { slug: 'a/b' })).toEqual([
				{ routeId: '/', url: '/' },
				{ routeId: '/docs', url: '/docs' },
				{ routeId: '/docs/[...slug]', url: '/docs/a' },
				{ routeId: '/docs/[...slug]', url: '/docs/a/b' }
			]);
		});

		it('emits a single level in single mode', () => {
			expect(walkRoute('/docs/[...slug]', '/docs/a/b', { slug: 'a/b' }, 'single')).toEqual([
				{ routeId: '/', url: '/' },
				{ routeId: '/docs', url: '/docs' },
				{ routeId: '/docs/[...slug]', url: '/docs/a/b' }
			]);
		});

		it('emits a level even when the rest matched zero segments', () => {
			expect(walkRoute('/docs/[...slug]', '/docs', { slug: '' })).toEqual([
				{ routeId: '/', url: '/' },
				{ routeId: '/docs', url: '/docs' },
				{ routeId: '/docs/[...slug]', url: '/docs' }
			]);
		});

		it('reserves trailing segments after a rest param', () => {
			expect(walkRoute('/a/[...rest]/z', '/a/x/y/z', { rest: 'x/y' })).toEqual([
				{ routeId: '/', url: '/' },
				{ routeId: '/a', url: '/a' },
				{ routeId: '/a/[...rest]', url: '/a/x' },
				{ routeId: '/a/[...rest]', url: '/a/x/y' },
				{ routeId: '/a/[...rest]/z', url: '/a/x/y/z' }
			]);
		});
	});
});
