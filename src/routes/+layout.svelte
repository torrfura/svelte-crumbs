<script lang="ts">
	import {PageMetaBreadcrumbs, PageMetaContext} from "$lib/components";

	let { children } = $props();

</script>

<PageMetaBreadcrumbs />

{@render children()}
