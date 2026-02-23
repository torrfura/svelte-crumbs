<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">About</h1>
<p class="mt-2 text-(--color-text-secondary)">This page has no breadcrumb export, demonstrating gap handling.</p>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">No breadcrumb export</h2>
<p class="mt-1 text-sm text-(--color-text-secondary)">When a route doesn't export <code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code>, it's simply skipped in the trail.</p>
