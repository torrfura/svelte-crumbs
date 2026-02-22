<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async (page) => ({
		label: page.data.product.name
	});
</script>

<script lang="ts">
	import CodeBlock from '../../CodeBlock.svelte';

	let { data } = $props();
</script>

<h1 class="text-2xl font-bold text-gray-900">{data.product.name}</h1>
<p class="mt-2 text-gray-600">Product ID: {data.product.id}</p>
<p class="mt-2">
	<a href="/products/{data.product.id}/edit" class="text-blue-600 hover:underline">Edit this product</a>
</p>

<h2 class="mt-8 text-lg font-semibold text-gray-800">Dynamic breadcrumb from load data</h2>
<p class="mt-1 text-sm text-gray-500">The label is pulled from <code class="rounded bg-gray-100 px-1 text-sm">page.data</code> populated by the layout's load function.</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: page.data.product.name
});`} />
