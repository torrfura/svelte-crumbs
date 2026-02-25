<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async (page) => ({
		label: page.data.product.name
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';

	let { data } = $props();
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">{data.product.name}</h1>
<p class="mt-2 text-(--color-text-secondary)">Product ID: {data.product.id}</p>
<p class="mt-2">
	<a href="/products/{data.product.id}/edit" class="text-(--color-accent) hover:underline">Edit this product</a>
</p>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Dynamic breadcrumb from load data</h2>
<p class="mt-1 text-(--color-text-secondary)">The label is pulled from <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.data</code> populated by the layout's load function.</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: page.data.product.name
});`} />
