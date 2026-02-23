<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Home'
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-gray-900">Home</h1>
<p class="mt-2 text-gray-600">Navigate to any route below to see breadcrumbs in action.</p>

<ul class="mt-4 space-y-1">
	<li><a href="/products" class="text-blue-600 hover:underline">Products</a></li>
	<li><a href="/products/42" class="text-blue-600 hover:underline">Product #42</a></li>
	<li><a href="/products/42/edit" class="text-blue-600 hover:underline">Edit Product #42</a></li>
	<li><a href="/docs" class="text-blue-600 hover:underline">Documentation</a></li>
	<li><a href="/docs/getting-started" class="text-blue-600 hover:underline">Getting Started</a></li>
	<li><a href="/playground" class="text-blue-600 hover:underline">Playground (live breadcrumb)</a></li>
	<li><a href="/about" class="text-blue-600 hover:underline">About (no breadcrumb)</a></li>
</ul>

<h2 class="mt-10 text-xl font-bold text-gray-900">Setup</h2>

<h3 class="mt-6 text-lg font-semibold text-gray-800">Root layout</h3>
<p class="mt-1 text-sm text-gray-500">
	Call <code class="rounded bg-gray-100 px-1 text-sm">createBreadcrumbs()</code> once in your root layout.
	It scans all <code class="rounded bg-gray-100 px-1 text-sm">+page.svelte</code> files for
	<code class="rounded bg-gray-100 px-1 text-sm">breadcrumb</code> exports and resolves them reactively.
</p>
<CodeBlock lang="svelte" code={`import { createBreadcrumbs } from 'svelte-crumbs';

const getBreadcrumbs = createBreadcrumbs();
const crumbs = $derived(await getBreadcrumbs());`} />

<h2 class="mt-10 text-xl font-bold text-gray-900">Patterns</h2>

<h3 class="mt-6 text-lg font-semibold text-gray-800">1. Static label</h3>
<p class="mt-1 text-sm text-gray-500">
	The simplest pattern — return a fixed label. Used on
	<a href="/products" class="text-blue-600 hover:underline">Products</a>,
	<a href="/docs" class="text-blue-600 hover:underline">Docs</a>, and this page.
</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Home'
});`} />

<h3 class="mt-8 text-lg font-semibold text-gray-800">2. Dynamic from load data</h3>
<p class="mt-1 text-sm text-gray-500">
	Read the label from <code class="rounded bg-gray-100 px-1 text-sm">page.data</code> populated by a layout's load function.
	See <a href="/products/42" class="text-blue-600 hover:underline">Product #42</a>.
</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: page.data.product.name
});`} />

<h3 class="mt-8 text-lg font-semibold text-gray-800">3. Remote function (server-side fetch)</h3>
<p class="mt-1 text-sm text-gray-500">
	Call a remote function inside the resolver — runs on the server, works with SSR.
	See <a href="/docs/getting-started" class="text-blue-600 hover:underline">Getting Started</a>.
</p>
<CodeBlock code={`import { getDocTitle } from '$lib/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`} />

<h3 class="mt-8 text-lg font-semibold text-gray-800">4. Optimistic update via command</h3>
<p class="mt-1 text-sm text-gray-500">
	Combine a <code class="rounded bg-gray-100 px-1 text-sm">query</code> in the breadcrumb with a
	<code class="rounded bg-gray-100 px-1 text-sm">command</code> + <code class="rounded bg-gray-100 px-1 text-sm">.withOverride()</code> for instant client-side updates.
	See <a href="/playground" class="text-blue-600 hover:underline">Playground</a>.
</p>
<CodeBlock code={`// breadcrumb reads from a query
export const breadcrumb: BreadcrumbMeta = async () => ({
  label: await getNickname()
});

// client updates via command with optimistic override
setNickname(value).updates(getNickname().withOverride(() => value));`} />

<h3 class="mt-8 text-lg font-semibold text-gray-800">5. No breadcrumb</h3>
<p class="mt-1 text-sm text-gray-500">
	Omit the export entirely — the route is skipped in the breadcrumb trail.
	See <a href="/about" class="text-blue-600 hover:underline">About</a>.
</p>
