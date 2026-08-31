<script lang="ts">
	import '../app.css';
	import { getCrumbs } from '$lib/index.js';
	import { initTheme } from '$lib/stores/theme.svelte.js';
	import TopNav from '$lib/components/top-nav.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { children }: { children: Snippet } = $props();

	const crumbs = $derived(await getCrumbs());
	let sidebarOpen = $state(false);
	const wide = $derived(page.url.pathname === '/');
	let animated = $state(true);

	onMount(() => {
		initTheme();
	});
</script>

<div class="min-h-screen bg-(--color-bg) text-(--color-text-primary) font-sans leading-relaxed">
	<TopNav onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} {crumbs} {animated} />
	<Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} bind:animated />

	<main class="pt-16 lg:pl-64">
		<div class={['mx-auto px-6 py-8', wide ? 'max-w-6xl' : 'max-w-3xl']}>
			<div class="mt-6">
				{@render children()}
			</div>

			<Footer />
		</div>
	</main>
</div>
