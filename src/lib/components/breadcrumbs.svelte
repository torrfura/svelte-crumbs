<script lang="ts">
	import { crossfade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import type { Breadcrumb } from '../breadcrumbs/types.js';

	let { crumbs, animated = true }: { crumbs: Breadcrumb[]; animated?: boolean } = $props();

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	let count = $derived(crumbs.length);
	let prevCount = $derived(crumbs.length);
	$effect.pre(() => {
		prevCount = count;
		count = crumbs.length;
	});

	const DURATION = 200;
	const STAGGER = 60;
	const IN_X = -4;
	const OUT_Y = 4;
	const CROSSFADE_DURATION = 200;
	const FLIP_DURATION = 150;
	const FLIP_DELAY = 150;

	const [send, receive] = crossfade({
		duration: CROSSFADE_DURATION,
		fallback(node, _params, intro) {
			if (!mounted) return { duration: 0 };
			const i = parseInt(node.getAttribute('data-i') ?? '0');
			const outTotal = (prevCount - 1) * STAGGER + DURATION;
			const delay = intro ? outTotal + i * STAGGER : Math.max(0, prevCount - 1 - i) * STAGGER;
			return fly(node, intro ? { x: IN_X, duration: DURATION, delay } : { y: OUT_Y, duration: DURATION, delay });
		}
	});
</script>

{#if animated}
	<nav
		aria-label="Breadcrumbs"
		class="grid auto-cols-auto justify-center items-center gap-2 rounded-lg px-4 py-3 text-sm"
	>
		{#each crumbs as crumb, i (crumb.url)}
			<span
				class="inline-flex items-center gap-2"
				data-i={i}
				style:grid-column={i + 1}
				style:grid-row="1"
				in:receive={{ key: crumb.url }}
				out:send={{ key: crumb.url }}
				animate:flip={{ duration: FLIP_DURATION, delay: FLIP_DELAY }}
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
{:else}
	<nav
		aria-label="Breadcrumbs"
		class="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
	>
		{#each crumbs as crumb, i (crumb.url)}
			{#if i > 0}
				<span aria-hidden="true" class="text-(--color-text-muted)">▶︎</span>
			{/if}
			{#if crumb.icon}
				{@const Icon = crumb.icon}
				<Icon />
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
{/if}
