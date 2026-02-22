<script lang="ts">
	import CodeBlock from '../CodeBlock.svelte';
</script>

<h1 class="text-2xl font-bold text-gray-900">About</h1>
<p class="mt-2 text-gray-600">This page has no breadcrumb export, demonstrating gap handling.</p>

<h2 class="mt-8 text-lg font-semibold text-gray-800">No breadcrumb export</h2>
<p class="mt-1 text-sm text-gray-500">When a route doesn't export <code class="rounded bg-gray-100 px-1 text-sm">breadcrumb</code>, it's simply skipped in the trail.</p>
<CodeBlock lang="svelte" code={`<!-- No breadcrumb export here -->
<h1>About</h1>
<p>This page has no breadcrumb export.</p>`} />
