<script lang="ts">
	import { getMetadataContext } from '$lib/context/page-metadata.svelte';
	import type { Snippet } from 'svelte';

	const metadata = getMetadataContext();

	type PageMetaBreadcrumbsProps = {
		breadcrumb?: Snippet;
	};

	let { breadcrumb }: PageMetaBreadcrumbsProps = $props();
</script>

<svelte:boundary>
	{@const breadcrumbs = await metadata.getBreadcrumbs()}
	<ul class="page-meta-breadcrumbs">
		{#each breadcrumbs as crumb (crumb.url)}
			<li>
				{#if breadcrumb}
					{@render breadcrumb(crumb)}
				{:else}
					<a href={crumb.url}>{crumb.label}</a>
				{/if}
			</li>
		{/each}
	</ul>
</svelte:boundary>
