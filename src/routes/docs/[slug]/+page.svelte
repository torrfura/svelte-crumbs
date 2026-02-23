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
	const slug = $derived(page.params.slug);
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">{title}</h1>

{#if slug === 'getting-started'}
	<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Installation</h2>
	<p class="mt-1 text-sm text-(--color-text-secondary)">
		Install <code class="rounded bg-(--color-code-bg) px-1 text-sm">svelte-crumbs</code> as a dependency:
	</p>
	<CodeBlock lang="bash" raw code={`pnpm install svelte-crumbs`} />

	<p class="mt-4 text-sm text-(--color-text-secondary)">
		Source code and issues on
		<a href="https://github.com/moment77/svelte-breadcrumbs" target="_blank" rel="noopener noreferrer" class="text-(--color-accent) hover:underline">GitHub</a>.
	</p>
{:else if slug === 'api-reference'}
	<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">BreadcrumbMeta</h2>
	<p class="mt-1 text-sm text-(--color-text-secondary)">
		Each <code class="rounded bg-(--color-code-bg) px-1 text-sm">+page.svelte</code> can export a
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> constant of type
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">BreadcrumbMeta</code>. It's an async function that receives the current
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> and returns a
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">{'{label, icon?}'}</code> object.
	</p>

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Static label</h3>
	<p class="mt-1 text-sm text-(--color-text-secondary)">Return a fixed string — the simplest pattern.</p>
	<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Products'
});`} />

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Dynamic from load data</h3>
	<p class="mt-1 text-sm text-(--color-text-secondary)">
		Read the label from <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.data</code> populated by a layout or page load function.
	</p>
	<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: page.data.product.name
});`} />

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Remote function</h3>
	<p class="mt-1 text-sm text-(--color-text-secondary)">
		Call a server-side remote function inside the resolver — works with SSR and doesn't block hydration.
	</p>
	<CodeBlock code={`import { getDocTitle } from '$lib/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`} />

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Optimistic update</h3>
	<p class="mt-1 text-sm text-(--color-text-secondary)">
		Combine a <code class="rounded bg-(--color-code-bg) px-1 text-sm">query</code> with a
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">command</code> and
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code> for instant client-side updates.
	</p>
	<CodeBlock code={`import { getNickname, setNickname } from '$lib/greeting.remote.js';

// breadcrumb reads from a query
export const breadcrumb: BreadcrumbMeta = async () => ({
  label: await getNickname()
});

// update with optimistic override — no round-trip
setNickname(value).updates(getNickname().withOverride(() => value));`} />

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">No breadcrumb</h3>
	<p class="mt-1 text-sm text-(--color-text-secondary)">
		Omit the export entirely — the route is simply skipped in the breadcrumb trail.
	</p>
{/if}

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Remote function breadcrumb</h2>
<p class="mt-1 text-sm text-(--color-text-secondary)">The label for this page is fetched server-side via a remote function — useful when the title isn't available in load data.</p>
<CodeBlock code={`import { getDocTitle } from '$lib/demo/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`} />
