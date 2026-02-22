<script lang="ts">
	import '../app.css';
	import { createBreadcrumbs } from '$lib/index.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const getBreadcrumbs = createBreadcrumbs();
	const crumbs = $derived(await getBreadcrumbs());
</script>

<div class="mx-auto max-w-3xl px-6 py-8 font-sans">
	<h1 class="text-xl"><a href="/">Svelte Breadcrumbs</a></h1>
	<h4>SSR + support for Remote Functions</h4>
	<hr class="my-5" />
	<nav
		aria-label="Breadcrumbs"
		class="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm"
	>
		{#each crumbs as crumb, i}
			{#if i > 0}
				<span aria-hidden="true" class="text-gray-400">/</span>
			{/if}
			{#if i < crumbs.length - 1}
				<a href={crumb.url} class="text-gray-700 hover:text-gray-900 hover:underline"
					>{crumb.label}</a
				>
			{:else}
				<span class="text-gray-900" aria-current="page">{crumb.label}</span>
			{/if}
		{/each}
	</nav>

	<div class="mt-6">
		{@render children()}
	</div>
</div>
