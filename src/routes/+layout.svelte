<script lang="ts">
	import '../app.css';
	import { createBreadcrumbs, Breadcrumbs } from '$lib/index.js';
	import { initTheme } from '$lib/stores/theme.svelte.js';
	import TopNav from '$lib/components/top-nav.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const getBreadcrumbs = createBreadcrumbs();
	const crumbs = $derived(await getBreadcrumbs());

	let sidebarOpen = $state(false);

	onMount(() => {
		initTheme();
	});
</script>

<div class="min-h-screen bg-(--color-bg) text-(--color-text-primary) font-sans">
	<TopNav onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} />
	<Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />

	<main class="pt-14 lg:pl-64">
		<div class="mx-auto max-w-3xl px-6 py-8">
			<h3 class="text-xl mb-2 text-(--color-text-primary)">Animated example</h3>
			<Breadcrumbs {crumbs} />
			<h3 class="text-xl my-2 text-(--color-text-primary)">Simple (static) example</h3>
			<nav
				aria-label="Breadcrumbs"
				class="flex items-center gap-2 rounded-lg bg-(--color-code-bg) px-4 py-3 text-sm"
			>
				{#each crumbs as crumb, i (crumb.url)}
					{#if i > 0}
						<span aria-hidden="true" class="text-(--color-text-muted)">/</span>
					{/if}
					{#if i < crumbs.length - 1 || crumbs.length === 1}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={crumb.url} class="text-(--color-text-secondary) hover:text-(--color-text-primary) hover:underline"
						>{crumb.label}</a
						>
					{:else}
						<span class="text-(--color-text-primary)" aria-current="page">{crumb.label}</span>
					{/if}
				{/each}
			</nav>

			<div class="mt-6">
				{@render children()}
			</div>

			<Footer />
		</div>
	</main>
</div>
