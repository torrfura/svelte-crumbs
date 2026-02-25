<script lang="ts">
	import '../app.css';
	import { createBreadcrumbs } from '$lib/index.js';
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
	let animated = $state(true);

	onMount(() => {
		initTheme();
	});
</script>

<div class="min-h-screen bg-(--color-bg) text-(--color-text-primary) font-sans leading-relaxed">
	<TopNav onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} {crumbs} {animated} />
	<Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} bind:animated />

	<main class="pt-14 lg:pl-64">
		<div class="mx-auto max-w-3xl px-6 py-8">
			<div class="mt-6">
				{@render children()}
			</div>

			<Footer />
		</div>
	</main>
</div>
