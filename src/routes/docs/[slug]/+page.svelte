<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';
	import { getDocTitle } from '$lib/demo/docs.remote.js';

	export const breadcrumb: BreadcrumbMeta = async (page) => ({
		label: await getDocTitle(page.params.slug ?? '')
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import CodeBlock from '$lib/components/code-block.svelte';

	const title = $derived(await getDocTitle(page.params.slug ?? ''));
</script>

<h1 class="text-2xl font-bold text-gray-900">{title}</h1>

<h2 class="mt-8 text-lg font-semibold text-gray-800">Remote function breadcrumb</h2>
<p class="mt-1 text-sm text-gray-500">The label is fetched server-side via a remote function — useful when the title isn't available in load data.</p>
<CodeBlock code={`import { getDocTitle } from '$lib/demo/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`} />
