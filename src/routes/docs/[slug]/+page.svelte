<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';
	import { getDocTitle } from '$lib/demo/docs.remote.js';

	export const breadcrumb: BreadcrumbMeta = async (page) => ({
		label: await getDocTitle(page.params.slug ?? '')
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import CodeBlock from '$lib/components/code-block.svelte';

	const title = $derived(await getDocTitle(page.params.slug ?? ''));
	const slug = $derived(page.params.slug);
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">{title}</h1>

{#if slug === 'getting-started'}
	<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Installation</h2>
	<p class="mt-1 text-(--color-text-secondary)">Install the package:</p>
	<CodeBlock lang="bash" raw code="pnpm install svelte-crumbs" />
	<h3 class="mt-6 text-lg font-semibold text-(--color-text-primary)">Root layout</h3>
	<p class="mt-1 text-(--color-text-secondary)">
		Call <code class="rounded bg-(--color-code-bg) px-1 text-sm">createBreadcrumbs()</code> once in your
		root layout. It scans your pages and returns a reactive array of crumbs for the current route.
	</p>
	<CodeBlock
		lang="svelte"
		raw
		code={`<` +
			`script lang="ts">
  import { createBreadcrumbs } from 'svelte-crumbs';

  const getBreadcrumbs = createBreadcrumbs();
  const crumbs = $derived(await getBreadcrumbs());
</` +
			`script>`}
	/>
	<p class="mt-4 text-(--color-text-secondary)">
		Source code and issues on
		<a
			href="https://github.com/torrfura/svelte-crumbs"
			target="_blank"
			rel="noopener noreferrer"
			class="text-(--color-accent) hover:underline">GitHub</a
		>.
	</p>
{:else if slug === 'api-reference'}
	<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">BreadcrumbMeta</h2>
	<p class="mt-1 text-(--color-text-secondary)">
		Any <code class="rounded bg-(--color-code-bg) px-1 text-sm">+page.svelte</code> can export a
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> of type
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">BreadcrumbMeta</code>: an async function
		that takes the current <code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> and
		returns <code class="rounded bg-(--color-code-bg) px-1 text-sm">{'{label, icon?}'}</code>.
	</p>

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Static label</h3>
	<p class="mt-1 text-(--color-text-secondary)">Return a fixed string.</p>
	<CodeBlock
		code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Products'
});`}
	/>

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Dynamic from load data</h3>
	<p class="mt-1 text-(--color-text-secondary)">
		Read the label from <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.data</code>,
		populated by a layout or page load. See
		<a
			href={resolve('/products/[productId]', { productId: '42' })}
			class="text-(--color-accent) hover:underline">Product #42</a
		>.
	</p>
	<CodeBlock
		code={`export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: page.data.product.name
});`}
	/>

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Remote function</h3>
	<p class="mt-1 text-(--color-text-secondary)">
		Call a remote function inside the resolver. SSR-safe, and it doesn't block hydration.
	</p>
	<CodeBlock
		code={`import { getDocTitle } from '$lib/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`}
	/>

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Optimistic update</h3>
	<p class="mt-1 text-(--color-text-secondary)">
		Pair a <code class="rounded bg-(--color-code-bg) px-1 text-sm">query</code> with a
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">command</code> and
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code> — the label
		changes before the server answers. See
		<a href={resolve('/playground')} class="text-(--color-accent) hover:underline">Playground</a>.
	</p>
	<CodeBlock
		code={`import { getNickname, setNickname } from '$lib/greeting.remote.js';

// breadcrumb reads from a query
export const breadcrumb: BreadcrumbMeta = async () => ({
  label: await getNickname()
});

// update with optimistic override — no round-trip
setNickname(value).updates(getNickname().withOverride(() => value));`}
	/>

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">
		Spread / catch-all routes
	</h3>
	<p class="mt-1 text-(--color-text-secondary)">
		The <code class="rounded bg-(--color-code-bg) px-1 text-sm">{`{ routes }`}</code> form defines
		breadcrumbs for several route patterns from one
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">[...rest]</code> page. The second
		argument (<code class="rounded bg-(--color-code-bg) px-1 text-sm">url</code>) is the
		breadcrumb's own path, not the full URL. See
		<a
			href={resolve('/spread/[...operator]', { operator: 'users/42/settings' })}
			class="text-(--color-accent) hover:underline">Spread routes</a
		>.
	</p>
	<CodeBlock
		code={`export const breadcrumb: BreadcrumbMeta = {
  routes: {
    '/spread': async () => ({ label: 'Spread' }),
    '/spread/[...rest]': async (_page, url) => ({
      label: url.split('/').pop() ?? 'overview'
    })
  }
};`}
	/>

	<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">No breadcrumb</h3>
	<p class="mt-1 text-(--color-text-secondary)">
		Omit the export — the segment is skipped. See <a
			href={resolve('/about')}
			class="text-(--color-accent) hover:underline">About</a
		>.
	</p>
{/if}

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Remote function breadcrumb</h2>
<p class="mt-1 text-(--color-text-secondary)">
	The crumb for this page — up in the trail above — comes from a remote function, for titles that
	never reach load data.
</p>
<CodeBlock
	code={`import { getDocTitle } from '$lib/demo/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`}
/>
