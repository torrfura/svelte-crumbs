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
		title: 'Patterns',
		items: [
			{ label: 'Static Label', href: resolve('/products') },
			{
				label: 'Dynamic from Load Data',
				href: resolve('/products/[productId]', { productId: '42' })
			},
			{ label: 'Nested Static', href: resolve('/products/[productId]/edit', { productId: '42' }) },
			{ label: 'Remote Function', href: resolve('/docs/[slug]', { slug: 'getting-started' }) },
			{ label: 'Optimistic Update', href: resolve('/playground') },
			// A rest parameter with an empty value resolves to the bare `/spread` path.
			{ label: 'Dynamic routing', href: resolve('/spread/[...operator]', { operator: '' }) },
			{ label: 'No Breadcrumb', href: resolve('/about') }
		]
	},
	{
		title: 'Examples',
		items: [
			{ label: 'Products', href: resolve('/products') },
			{ label: 'Documentation', href: resolve('/docs') },
			{ label: 'Reactive Updates', href: resolve('/playground') }
		]
	}
];
