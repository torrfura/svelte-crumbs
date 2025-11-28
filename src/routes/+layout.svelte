<script lang="ts">
	import { Breadcrumbs, setMetadataContext } from "$lib";
	import type { Breadcrumb } from '$lib/types';
	setMetadataContext();

	let { children } = $props();

</script>

<Breadcrumbs />
<Breadcrumbs>
	{#snippet breadcrumb(crumb: Breadcrumb )}
		<a href={crumb.url}>{crumb.label}</a>
	{/snippet}
</Breadcrumbs>

{@render children()}
