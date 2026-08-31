<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Documentation'
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Documentation</h1>
<ul class="mt-4 space-y-1">
	<li>
		<a
			href={resolve('/docs/[slug]', { slug: 'getting-started' })}
			class="text-(--color-accent) hover:underline">Getting Started</a
		>
	</li>
	<li>
		<a
			href={resolve('/docs/[slug]', { slug: 'api-reference' })}
			class="text-(--color-accent) hover:underline">API Reference</a
		>
	</li>
</ul>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Static breadcrumb</h2>
<p class="mt-1 text-(--color-text-secondary)">Fixed label for the documentation index.</p>
<CodeBlock
	code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Documentation'
});`}
/>
