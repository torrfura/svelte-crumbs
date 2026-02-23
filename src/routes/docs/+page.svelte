<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Documentation'
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-gray-900">Documentation</h1>
<ul class="mt-4 space-y-1">
	<li><a href="/docs/getting-started" class="text-blue-600 hover:underline">Getting Started</a></li>
	<li><a href="/docs/api-reference" class="text-blue-600 hover:underline">API Reference</a></li>
</ul>

<h2 class="mt-8 text-lg font-semibold text-gray-800">Static breadcrumb</h2>
<p class="mt-1 text-sm text-gray-500">Fixed label for the documentation index.</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Documentation'
});`} />
