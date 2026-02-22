<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Products'
	});
</script>

<script lang="ts">
	import CodeBlock from '../CodeBlock.svelte';
</script>

<h1 class="text-2xl font-bold text-gray-900">Products</h1>
<ul class="mt-4 space-y-1">
	<li><a href="/products/42" class="text-blue-600 hover:underline">Product #42</a></li>
	<li><a href="/products/99" class="text-blue-600 hover:underline">Product #99</a></li>
</ul>

<h2 class="mt-8 text-lg font-semibold text-gray-800">Static breadcrumb</h2>
<p class="mt-1 text-sm text-gray-500">Fixed label, same as the home page pattern.</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Products'
});`} />
