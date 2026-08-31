<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Svelte Crumbs'
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import CodeBlock from '$lib/components/code-block.svelte';

	const layoutSnippet =
		`<` +
		`script lang="ts">
  import { createBreadcrumbs } from 'svelte-crumbs';

  const get = createBreadcrumbs();
  const crumbs = $derived(await get());
</` +
		`script>`;

	const pageSnippet =
		`<` +
		`script module lang="ts">
  import type { BreadcrumbMeta } from 'svelte-crumbs';

  export const breadcrumb: BreadcrumbMeta = async (page) => ({
    label: page.data.product.name
  });
</` +
		`script>`;

	const facts = [
		{ n: '01', title: 'Zero config', body: 'No route table. Pages describe themselves.' },
		{
			n: '02',
			title: 'SSR-ready',
			body: 'Resolves in top-level await. No {#await} blocks, no flash.'
		},
		{ n: '03', title: 'Reactive', body: 'Remote functions and optimistic queries, tracked.' }
	];

	const routes = [
		{ label: '/products/42', href: resolve('/products/[productId]', { productId: '42' }) },
		{ label: '/docs/getting-started', href: resolve('/docs/[slug]', { slug: 'getting-started' }) },
		{
			label: '/spread/users/42/settings',
			href: resolve('/spread/[...operator]', { operator: 'users/42/settings' })
		},
		{ label: '/playground', href: resolve('/playground') }
	];
</script>

<!-- ────────────────────────────────── HERO ────────────────────────────────── -->
<section class="grid grid-cols-1 gap-12 pt-16 xl:grid-cols-2 xl:gap-10 2xl:gap-16">
	<div class="flex flex-col gap-6">
		<p class="font-mono text-[11px] tracking-[0.14em] text-(--color-accent) uppercase">
			SvelteKit navigation
		</p>
		<h1 class="text-5xl leading-[1.04] font-bold tracking-[-0.038em] text-balance lg:text-[62px]">
			Server-rendered breadcrumbs.
		</h1>
		<p class="max-w-[42ch] text-[17px] leading-relaxed text-(--color-text-secondary)">
			Resolved during SSR, reactive after hydration. Zero config.
		</p>
		<div class="flex flex-wrap items-center gap-3 pt-2">
			<a
				href={resolve('/docs/[slug]', { slug: 'getting-started' })}
				class="inline-flex h-[46px] w-full items-center justify-center rounded-lg bg-(--color-accent-solid) px-5 text-sm font-semibold text-(--color-on-accent) transition hover:opacity-90 sm:w-auto"
			>
				Read the docs
			</a>
			<span
				class="inline-flex h-[46px] w-full items-center gap-3 rounded-lg border border-(--color-border) px-[18px] font-mono text-[13px] text-(--color-text-secondary) sm:w-auto"
			>
				npm i svelte-crumbs
				<svg
					aria-hidden="true"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-(--color-text-muted)"
				>
					<rect x="9" y="9" width="12" height="12" rx="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
			</span>
		</div>
	</div>

	<div
		class="flex flex-col overflow-hidden rounded-[14px] border border-(--color-border) bg-(--color-bg-sidebar)"
	>
		<div class="flex h-10 items-center gap-2 border-b border-(--color-border) px-4">
			<span class="size-[9px] rounded-full bg-(--color-border)"></span>
			<span class="size-[9px] rounded-full bg-(--color-border)"></span>
			<span class="size-[9px] rounded-full bg-(--color-border)"></span>
			<span class="pl-2.5 font-mono text-[11px] text-(--color-text-muted)">+layout.svelte</span>
		</div>
		<CodeBlock lang="svelte" raw code={layoutSnippet} bare />
		<div
			aria-hidden="true"
			class="flex items-center gap-2.5 border-t border-(--color-border) px-[22px] py-[18px] text-sm"
		>
			<span class="text-(--color-text-muted)">Home</span>
			<svg
				width="13"
				height="13"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-(--color-border)"
			>
				<path d="m9 18 6-6-6-6" />
			</svg>
			<span class="text-(--color-text-muted)">Products</span>
			<svg
				width="13"
				height="13"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-(--color-border)"
			>
				<path d="m9 18 6-6-6-6" />
			</svg>
			<span class="font-semibold">Nike Air Max 90</span>
		</div>
	</div>
</section>

<!-- ─────────────────────────────── THREE FACTS ────────────────────────────── -->
<section
	class="mt-26 grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-(--color-border) bg-(--color-border) sm:grid-cols-3"
>
	{#each facts as fact (fact.n)}
		<div class="flex flex-col gap-2 bg-(--color-bg) p-[30px]">
			<div class="font-mono text-[11px] text-(--color-accent)">{fact.n}</div>
			<h2 class="text-base font-semibold">{fact.title}</h2>
			<p class="text-[13px] leading-relaxed text-(--color-text-secondary)">{fact.body}</p>
		</div>
	{/each}
</section>

<!-- ──────────────────────────── ONE EXPORT PER PAGE ───────────────────────── -->
<section class="mt-26 flex flex-col gap-8">
	<div class="flex flex-col gap-4">
		<h2 class="text-[34px] leading-tight font-bold tracking-[-0.028em]">One export per page.</h2>
		<p class="max-w-[40ch] text-[15px] leading-relaxed text-(--color-text-secondary)">
			Return a label from anything you can await — load data, a remote function, a query.
		</p>
	</div>
	<div
		class="flex flex-col overflow-hidden rounded-[14px] border border-(--color-border) bg-(--color-bg-sidebar)"
	>
		<div class="flex h-10 items-center border-b border-(--color-border) px-4">
			<span class="font-mono text-[11px] text-(--color-text-muted)">products/[id]/+page.svelte</span
			>
		</div>
		<CodeBlock lang="svelte" raw code={pageSnippet} bare />
	</div>
</section>

<!-- ────────────────────────────── LIVE ROUTES ─────────────────────────────── -->
<section class="mt-26 flex flex-col gap-4">
	<h2 class="font-mono text-[11px] tracking-[0.14em] text-(--color-text-muted) uppercase">
		Live routes
	</h2>
	<div class="flex flex-wrap gap-2.5">
		{#each routes as route (route.href)}
			<a
				href={route.href}
				class="rounded-lg border border-(--color-border) px-[15px] py-2.5 font-mono text-[13px] text-(--color-text-secondary) transition hover:border-(--color-accent) hover:text-(--color-accent)"
			>
				{route.label}
			</a>
		{/each}
	</div>
</section>
