<script lang="ts">
	import '../app.css';
	import { createBreadcrumbs, Breadcrumbs } from '$lib/index.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const getBreadcrumbs = createBreadcrumbs();
	const crumbs = $derived(await getBreadcrumbs());
</script>

<div class="mx-auto max-w-3xl px-6 py-8 font-sans">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<h1 class="text-4xl mb-4"><a href="/">svelte-crumbs</a></h1>
	<p class="mt-2 text-sm text-gray-600">
		Automatic, zero-config breadcrumbs for SvelteKit. Define an async resolver per route and the
		library builds the trail for you — fully SSR-compatible via top-level await and ready for
		remote functions, so labels can be fetched from APIs or databases without blocking hydration.
	</p>
	<hr class="my-5" />
	<h3 class="text-xl mb-2">Animated example</h3>
	<Breadcrumbs {crumbs} />
	<h3 class="text-xl my-2">Simple (static) example</h3>
	<nav
		aria-label="Breadcrumbs"
		class="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm"
	>
		{#each crumbs as crumb, i (crumb.url)}
			{#if i > 0}
				<span aria-hidden="true" class="text-gray-400">/</span>
			{/if}
			{#if i < crumbs.length - 1 || crumbs.length === 1}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={crumb.url} class="text-gray-500 hover:text-gray-900 hover:underline"
				>{crumb.label}</a
				>
			{:else}
				<span class="text-gray-700" aria-current="page">{crumb.label}</span>
			{/if}
		{/each}
	</nav>

	<div class="mt-6">
		{@render children()}
	</div>
</div>
