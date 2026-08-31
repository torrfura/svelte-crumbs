import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';

export interface NavItem {
	label: string;
	href: ResolvedPathname;
}

export interface NavSection {
	title: string;
	items: NavItem[];
}

export const navigation: NavSection[] = [
	{
		title: 'Getting Started',
		items: [
			{ label: 'Introduction', href: resolve('/') },
			{ label: 'Installation', href: resolve('/docs/[slug]', { slug: 'getting-started' }) },
			{ label: 'API Reference', href: resolve('/docs/[slug]', { slug: 'api-reference' }) },
			{ label: 'How it works', href: resolve('/docs/internals') }
		]
	},
	{
		title: 'Rendering',
		items: [
			{ label: 'Animated', href: resolve('/docs/rendering/animated') },
			{ label: 'Static', href: resolve('/docs/rendering/static') }
		]
	},
	{
		title: 'Live examples',
		items: [
			{ label: 'Products', href: resolve('/products') },
			{ label: 'Product #42', href: resolve('/products/[productId]', { productId: '42' }) },
			{ label: 'Edit product', href: resolve('/products/[productId]/edit', { productId: '42' }) },
			{ label: 'Playground', href: resolve('/playground') },
			// A rest parameter with an empty value resolves to the bare `/spread` path.
			{ label: 'Spread routes', href: resolve('/spread/[...operator]', { operator: '' }) },
			{ label: 'About', href: resolve('/about') }
		]
	}
];
