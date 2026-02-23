<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Home'
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Home</h1>
<p class="mt-2 text-(--color-text-secondary)">Navigate to any route below to see breadcrumbs in action.</p>

<ul class="mt-4 space-y-1">
	<li><a href="/products" class="text-(--color-accent) hover:underline">Products</a></li>
	<li><a href="/products/42" class="text-(--color-accent) hover:underline">Product #42</a></li>
	<li><a href="/products/42/edit" class="text-(--color-accent) hover:underline">Edit Product #42</a></li>
	<li><a href="/docs" class="text-(--color-accent) hover:underline">Documentation</a></li>
	<li><a href="/docs/getting-started" class="text-(--color-accent) hover:underline">Getting Started</a></li>
	<li><a href="/playground" class="text-(--color-accent) hover:underline">Reactive Updates (live breadcrumb)</a></li>
	<li><a href="/about" class="text-(--color-accent) hover:underline">About (no breadcrumb)</a></li>
</ul>

<h2 class="mt-10 text-xl font-bold text-(--color-text-primary)">Setup</h2>

<h3 class="mt-6 text-lg font-semibold text-(--color-text-primary)">Root layout</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	Call <code class="rounded bg-(--color-code-bg) px-1 text-sm">createBreadcrumbs()</code> once in your root layout.
	It scans all <code class="rounded bg-(--color-code-bg) px-1 text-sm">+page.svelte</code> files for
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> exports and resolves them reactively.
</p>
<CodeBlock lang="svelte" code={`import { createBreadcrumbs } from 'svelte-crumbs';

const getBreadcrumbs = createBreadcrumbs();
const crumbs = $derived(await getBreadcrumbs());`} />

<h2 class="mt-10 text-xl font-bold text-(--color-text-primary)">Displaying Breadcrumbs</h2>
<p class="mt-2 text-sm text-(--color-text-secondary)">
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">svelte-crumbs</code> gives you a reactive
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">crumbs</code> array — how you render it is up to you. Here are two approaches you can drop into your layout.
</p>

<h3 class="mt-6 text-lg font-semibold text-(--color-text-primary)">Animated breadcrumbs</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	Uses Svelte transitions (<code class="rounded bg-(--color-code-bg) px-1 text-sm">fly</code>) and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">animate:flip</code> for smooth enter/exit animations with staggered delays. Try navigating between pages above to see it in action.
</p>
<CodeBlock lang="svelte" code={`<` + `script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { onMount } from 'svelte';
  import type { Breadcrumb } from 'svelte-crumbs';

  let { crumbs }: { crumbs: Breadcrumb[] } = $props();

  let mounted = $state(false);
  onMount(() => { mounted = true; });

  let prevCount = $state(crumbs.length);
  $effect(() => { prevCount = crumbs.length; });

  function flyIn(node: Element, params: { y?: number; duration?: number; i?: number }) {
    if (!mounted) return { duration: 0 };
    const { i: index = 0, ...rest } = params;
    return fly(node, { ...rest, delay: index * 60 });
  }

  function flyOut(node: Element, params: { y?: number; duration?: number; i?: number }) {
    if (!mounted) return { duration: 0 };
    const { i: index = 0, ...rest } = params;
    return fly(node, { ...rest, delay: Math.max(0, prevCount - 1 - index) * 60 });
  }
</` + `script>

<nav aria-label="Breadcrumbs" class="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm">
  {#each crumbs as crumb, i (crumb.url)}
    <span class="inline-flex items-center gap-2"
      in:flyIn={{ y: -10, duration: 200, i }}
      out:flyOut={{ y: 10, duration: 200, i }}
      animate:flip={{ duration: 200 }}>
      {#if i > 0}
        <span aria-hidden="true" class="text-gray-400">▶︎</span>
      {/if}
      {#if i < crumbs.length - 1 || crumbs.length === 1}
        <a href={crumb.url} class="text-gray-500 hover:text-gray-900 hover:underline">{crumb.label}</a>
      {:else}
        <span class="text-gray-700" aria-current="page">{crumb.label}</span>
      {/if}
    </span>
  {/each}
</nav>`} />

<h3 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Simple static breadcrumbs</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	A minimal <code class="rounded bg-(--color-code-bg) px-1 text-sm">{'{#each}'}</code> loop with no animations — lightweight and easy to customize.
</p>
<CodeBlock lang="svelte" code={`<nav aria-label="Breadcrumbs" class="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm">
  {#each crumbs as crumb, i (crumb.url)}
    {#if i > 0}
      <span aria-hidden="true" class="text-gray-400">/</span>
    {/if}
    {#if i < crumbs.length - 1 || crumbs.length === 1}
      <a href={crumb.url} class="text-gray-500 hover:text-gray-900 hover:underline">{crumb.label}</a>
    {:else}
      <span class="text-gray-700" aria-current="page">{crumb.label}</span>
    {/if}
  {/each}
</nav>`} />

<h2 class="mt-10 text-xl font-bold text-(--color-text-primary)">Patterns</h2>

<h3 class="mt-6 text-lg font-semibold text-(--color-text-primary)">1. Static label</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	The simplest pattern — return a fixed label. Used on
	<a href="/products" class="text-(--color-accent) hover:underline">Products</a>,
	<a href="/docs" class="text-(--color-accent) hover:underline">Docs</a>, and this page.
</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Home'
});`} />

<h3 class="mt-8 text-lg font-semibold text-(--color-text-primary)">2. Dynamic from load data</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	Read the label from <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.data</code> populated by a layout's load function.
	See <a href="/products/42" class="text-(--color-accent) hover:underline">Product #42</a>.
</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: page.data.product.name
});`} />

<h3 class="mt-8 text-lg font-semibold text-(--color-text-primary)">3. Remote function (server-side fetch)</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	Call a remote function inside the resolver — runs on the server, works with SSR.
	See <a href="/docs/getting-started" class="text-(--color-accent) hover:underline">Getting Started</a>.
</p>
<CodeBlock code={`import { getDocTitle } from '$lib/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`} />

<h3 class="mt-8 text-lg font-semibold text-(--color-text-primary)">4. Optimistic update via command</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	Combine a <code class="rounded bg-(--color-code-bg) px-1 text-sm">query</code> in the breadcrumb with a
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">command</code> + <code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code> for instant client-side updates.
	See <a href="/playground" class="text-(--color-accent) hover:underline">Playground</a>.
</p>
<CodeBlock code={`// breadcrumb reads from a query
export const breadcrumb: BreadcrumbMeta = async () => ({
  label: await getNickname()
});

// client updates via command with optimistic override
setNickname(value).updates(getNickname().withOverride(() => value));`} />

<h3 class="mt-8 text-lg font-semibold text-(--color-text-primary)">5. No breadcrumb</h3>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	Omit the export entirely — the route is skipped in the breadcrumb trail.
	See <a href="/about" class="text-(--color-accent) hover:underline">About</a>.
</p>
