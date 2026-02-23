export interface NavItem {
	label: string;
	href: string;
}

export interface NavSection {
	title: string;
	items: NavItem[];
}

export const navigation: NavSection[] = [
	{
		title: 'Getting Started',
		items: [
			{ label: 'Introduction', href: '/' },
			{ label: 'Installation', href: '/docs/getting-started' },
			{ label: 'API Reference', href: '/docs/api-reference' }
		]
	},
	{
		title: 'Patterns',
		items: [
			{ label: 'Static Label', href: '/products' },
			{ label: 'Dynamic from Load Data', href: '/products/42' },
			{ label: 'Nested Static', href: '/products/42/edit' },
			{ label: 'Remote Function', href: '/docs/getting-started' },
			{ label: 'Optimistic Update', href: '/playground' },
			{ label: 'No Breadcrumb', href: '/about' }
		]
	},
	{
		title: 'Examples',
		items: [
			{ label: 'Products', href: '/products' },
			{ label: 'Documentation', href: '/docs' },
			{ label: 'Reactive Updates', href: '/playground' }
		]
	}
];
