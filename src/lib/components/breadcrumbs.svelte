<script lang="ts">
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import type { Breadcrumb } from '../breadcrumbs/types.js';

	let { crumbs }: { crumbs: Breadcrumb[] } = $props();

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	let prevCount = $derived(crumbs.length);
	$effect(() => {
		prevCount = crumbs.length;
	});

	function flyIn(node: Element, params: { y?: number; duration?: number; i?: number }) {
		if (!mounted) return { duration: 0 };
		const { i: index = 0, ...flyParams } = params;
		return fly(node, { ...flyParams, delay: index * 60 });
	}

	function flyOut(node: Element, params: { y?: number; duration?: number; i?: number }) {
		if (!mounted) return { duration: 0 };
		const { i: index = 0, ...flyParams } = params;
		const reverseIndex = prevCount - 1 - index;
		return fly(node, { ...flyParams, delay: Math.max(0, reverseIndex) * 60 });
	}
</script>

<nav
	aria-label="Breadcrumbs"
	class="flex items-center gap-2 rounded-lg bg-(--color-code-bg) px-4 py-3 text-sm"
>
	{#each crumbs as crumb, i (crumb.url)}
		<span
			class="inline-flex items-center gap-2"
			in:flyIn={{ y: -10, duration: 200, i }}
			out:flyOut={{ y: 10, duration: 200, i }}
			animate:flip={{ duration: 200 }}
		>
			{#if i > 0}
				<span aria-hidden="true" class="text-(--color-text-muted)">▶︎</span>
			{/if}
			{#if crumb.icon}
				{@const Icon = crumb.icon}
				<Icon />
			{/if}
			{#if i < crumbs.length - 1 || crumbs.length === 1}
				<a href={crumb.url} class="text-(--color-text-secondary) hover:text-(--color-text-primary) hover:underline"
					>{crumb.label}</a
				>
			{:else}
				<span class="text-(--color-text-primary)" aria-current="page">{crumb.label}</span>
			{/if}
		</span>
	{/each}
</nav>
