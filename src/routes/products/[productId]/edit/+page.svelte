<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Edit'
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Edit Product #{page.params.productId}</h1>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Nested static breadcrumb</h2>
<p class="mt-1 text-(--color-text-secondary)">Deeply nested route with a simple fixed label. The parent's dynamic label is resolved independently.</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Edit'
});`} />
