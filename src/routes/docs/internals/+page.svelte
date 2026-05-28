<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'How it works'
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-(--color-text-primary)">How svelte-crumbs works</h1>
<p class="text-(--color-text-secondary)">
	A deep dive into the internals so you know exactly what runs, when it runs, and why it is safe.
</p>

<h2 class="text-(--color-text-primary)">Architecture</h2>

<h3 class="text-(--color-text-primary)">1. Module scanning</h3>
<p class="text-(--color-text-secondary)">
	At startup, <code class="rounded bg-(--color-code-bg) px-1 text-sm">buildBreadcrumbMap()</code>
	calls
	<code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>import.meta.glob('/src/routes/**/+page.svelte')</code
	>
	in <strong>non-eager</strong> mode. Vite returns a record of lazy loader functions — one per page file.
	No component code is imported at this point; only the file paths are known.
</p>
<p class="text-(--color-text-secondary)">
	All loaders are invoked in parallel via <code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>Promise.all</code
	>. Each loader resolves to the page module, and only the module-level
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> export is read. Pages without
	a breadcrumb export are skipped. The result is a flat map of route patterns to resolvers.
</p>

<h3 class="text-(--color-text-primary)">2. Route matching</h3>
<p class="text-(--color-text-secondary)">
	When the URL changes, <code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>getResolversForRoute()</code
	>
	walks path segments from root to leaf. For
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42/edit</code> it checks
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42</code>, and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42/edit</code>. Each segment is
	looked up — first by exact match, then by dynamic
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[param]</code> pattern, then by
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[...spread]</code> pattern. This lookup is
	<strong>fully synchronous</strong>.
</p>

<h3 class="text-(--color-text-primary)">3. Resolution</h3>
<p class="text-(--color-text-secondary)">
	The collected resolvers are called in parallel. Each receives a snapshot of
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> state (params, data, url) and
	the breadcrumb's own URL path. They return
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">{`{ label, icon? }`}</code> or
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">undefined</code> to skip a segment.
</p>

<h2 class="text-(--color-text-primary)">SSR safety</h2>
<p class="text-(--color-text-secondary)">
	SvelteKit's <code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> proxy is tied to
	the current request via component context. Reading it after an
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">await</code> on the server throws because the
	rendering context is gone. svelte-crumbs handles this in two ways:
</p>
<ul class="text-(--color-text-secondary)">
	<li>
		<strong>Snapshot before await</strong> —
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> state is captured into a
		plain object <em>synchronously</em>, before the one-time
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">await ready</code> that loads modules on the
		first render. Resolvers receive this safe snapshot, never the live proxy.
	</li>
	<li>
		<strong
			>Cached pathname via <code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived</code
			></strong
		>
		— the route resolver reads a cached
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived(page.url.pathname)</code>
		evaluated in the rendering context. After the await boundary, Svelte returns the cached value without
		re-reading the proxy.
	</li>
</ul>
<p class="text-(--color-text-secondary)">
	The result: full SSR support with no
	<code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>"Cannot read page.params outside rendering"</code
	> errors, and no leaked state between requests.
</p>

<h2 class="text-(--color-text-primary)">Reactive tracking</h2>
<p class="text-(--color-text-secondary)">
	The resolver map is built once (async), then kept in a
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">$state</code>-gated
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived</code>. After the initial load,
	<strong
		>there are no awaits between the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived</code> read and the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">resolve()</code> call</strong
	>. This means Svelte's fine-grained tracking reaches into every resolver: if a resolver calls a
	reactive query (like SvelteKit's
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">query()</code>), the signal is tracked and
	the breadcrumbs automatically re-resolve when it changes — including optimistic updates via
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code>.
</p>

<h2 class="text-(--color-text-primary)">Performance</h2>

<h3 class="text-(--color-text-primary)">Bundle size</h3>
<p class="text-(--color-text-secondary)">
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">import.meta.glob</code> runs in
	<strong>non-eager</strong> mode. Vite code-splits each page module separately — the breadcrumb map
	only pulls in the thin module-level
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> export, not the full component
	tree.
</p>

<h3 class="text-(--color-text-primary)">Runtime cost</h3>
<ul class="text-(--color-text-secondary)">
	<li>
		<strong>Startup</strong> — page modules load in parallel via
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">Promise.all</code>. One-time cost
		resolved before first render.
	</li>
	<li>
		<strong>Navigation</strong> — route matching is a synchronous loop. Static patterns hit an O(1) map;
		dynamic patterns are precompiled and cached per-route. Sub-millisecond for typical apps.
	</li>
	<li>
		<strong>Re-renders</strong> — the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived</code> only re-evaluates when
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">page.url.pathname</code> changes or a tracked
		query signal fires. No polling, no intervals.
	</li>
</ul>

<h2 class="text-(--color-text-primary)">Patterns</h2>

<h3 class="text-(--color-text-primary)">Static label</h3>
<p class="text-(--color-text-secondary)">The simplest pattern — return a fixed label.</p>
<CodeBlock
	code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: 'Home'
});`}
/>

<h3 class="text-(--color-text-primary)">Dynamic from load data</h3>
<p class="text-(--color-text-secondary)">
	Read the label from <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.data</code>
	populated by a layout's load function. See
	<a href="/products/42" class="text-(--color-accent) hover:underline">Product #42</a>.
</p>
<CodeBlock
	code={`export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: page.data.product.name
});`}
/>

<h3 class="text-(--color-text-primary)">Remote function</h3>
<p class="text-(--color-text-secondary)">
	Call a server-side function inside the resolver — runs on the server, works with SSR.
</p>
<CodeBlock
	code={`import { getDocTitle } from '$lib/docs.remote.js';

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: await getDocTitle(page.params.slug ?? '')
});`}
/>

<h3 class="text-(--color-text-primary)">Optimistic update</h3>
<p class="text-(--color-text-secondary)">
	Combine a <code class="rounded bg-(--color-code-bg) px-1 text-sm">query</code> with a
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">command</code> +
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code> for instant
	client-side updates — no round-trip. See
	<a href="/playground" class="text-(--color-accent) hover:underline">Playground</a>.
</p>
<CodeBlock
	code={`export const breadcrumb: BreadcrumbMeta = async () => ({
  label: await getNickname()
});

// on save — breadcrumb updates instantly
setNickname(value).updates(getNickname().withOverride(() => value));`}
/>

<h3 class="text-(--color-text-primary)">Spread / catch-all routes</h3>
<p class="text-(--color-text-secondary)">
	Use the <code class="rounded bg-(--color-code-bg) px-1 text-sm">{`{ routes }`}</code> form to
	define breadcrumbs for multiple route patterns from a single
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[...rest]</code> page. The second argument
	(<code class="rounded bg-(--color-code-bg) px-1 text-sm">url</code>) is the breadcrumb's own path,
	not the full URL. See
	<a href="/spread/users/42/settings" class="text-(--color-accent) hover:underline">Spread routes</a
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

<h3 class="text-(--color-text-primary)">No breadcrumb</h3>
<p class="text-(--color-text-secondary)">
	Omit the export entirely — the route is silently skipped in the breadcrumb trail. See <a
		href="/about"
		class="text-(--color-accent) hover:underline">About</a
	>.
</p>
