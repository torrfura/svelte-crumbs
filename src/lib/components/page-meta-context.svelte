<script lang="ts">
	import {setMetadataContext} from "$lib/context/page-metadata.svelte";
	const metadata = setMetadataContext();

	let { children } = $props();

</script>

{@render children()}
