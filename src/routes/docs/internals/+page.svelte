<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'How it works'
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-(--color-text-primary)">How svelte-crumbs works</h1>
<p class="text-(--color-text-secondary)">
	A deep dive into the internals so you know exactly what runs, when it runs, and why it is safe.
</p>

<h2 class="text-(--color-text-primary)">Architecture</h2>

<h3 class="text-(--color-text-primary)">1. Route index</h3>
<p class="text-(--color-text-secondary)">
	The first call to <code class="rounded bg-(--color-code-bg) px-1 text-sm">getCrumbs()</code> builds
	a route index from
	<code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>import.meta.glob('/src/routes/**/+page.svelte')</code
	>. Only the <strong>keys</strong> of the glob record are used at this point — each file path is
	converted to a group-free route id, so
	<code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>/src/routes/(app)/products/[id]/+page.svelte</code
	>
	becomes <code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/[id]</code>. This is pure
	string work over the key list: <strong>fully synchronous, and no module is loaded</strong> at startup.
</p>

<h3 class="text-(--color-text-primary)">2. Walking the route</h3>
<p class="text-(--color-text-secondary)">
	On every navigation, <code class="rounded bg-(--color-code-bg) px-1 text-sm">getCrumbs()</code>
	reads <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.route.id</code> and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">page.url.pathname</code> synchronously.
	SvelteKit has already decided which route matched, so there is no custom pattern matcher — the walk
	only pairs route-id segments with pathname segments to learn how many pathname segments each route segment
	consumed:
</p>
<ul class="text-(--color-text-secondary)">
	<li>
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">(group)</code> segments consume nothing
	</li>
	<li>
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">[[optional]]</code> segments consume 0 or
		1, disambiguated via <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.params</code>
	</li>
	<li>
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">[...rest]</code> segments consume
		whatever is left over
	</li>
	<li>
		everything else — static, <code class="rounded bg-(--color-code-bg) px-1 text-sm">[param]</code>,
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">[p=matcher]</code>, compound
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">foo-[c]</code> — consumes exactly 1
	</li>
</ul>
<p class="text-(--color-text-secondary)">
	The walk produces one <em>level</em> per segment, each pairing a route-id prefix with a concrete
	pathname prefix. For <code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42/edit</code>
	(route id
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/[productId]/edit</code>) the
	levels are <code class="rounded bg-(--color-code-bg) px-1 text-sm">/</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42</code>, and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42/edit</code>. Error pages
	rendered without a matched route (<code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>page.route.id === null</code
	>) short-circuit to an empty trail.
</p>

<h3 class="text-(--color-text-primary)">3. Lazy module loading</h3>
<p class="text-(--color-text-secondary)">
	Only the page modules whose route id is one of the walked prefixes are imported — for
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42/edit</code> that is at most the
	pages at <code class="rounded bg-(--color-code-bg) px-1 text-sm">/</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/[productId]</code>, and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/[productId]/edit</code>. Each
	load is memoized, so a module is imported <strong>at most once</strong> for the lifetime of the app.
	A loaded module registers its
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> export into the index —
	keyed by its route id (function form) or by its normalized
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">{`{ routes }`}</code> keys.
</p>

<h3 class="text-(--color-text-primary)">4. Resolution</h3>
<p class="text-(--color-text-secondary)">
	For each level, the index is checked with two exact Map lookups — a
	<strong>concrete-pathname key wins over a route-id key</strong>, so a
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">{`{ routes }`}</code> entry like
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">'/spread'</code> takes precedence over the
	route id that matched the same level. The collected resolvers then run <strong>in parallel</strong>.
	Each receives a snapshot of
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> state (params, data, url) and the
	breadcrumb's own URL path, and returns
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">{`{ label, icon? }`}</code> or
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">undefined</code> to skip a segment. Errors are
	isolated per resolver: a throwing resolver is logged and skipped instead of taking down the whole trail.
</p>

<h2 class="text-(--color-text-primary)">SSR safety</h2>
<p class="text-(--color-text-secondary)">
	SvelteKit's <code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> proxy is tied to
	the current request via component context. Reading it after an
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">await</code> on the server throws because the
	rendering context is gone. svelte-crumbs therefore reads everything it needs —
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">route.id</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">url</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">params</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">data</code> —
	<em>synchronously</em>, before the first
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">await</code>, and captures it into a plain
	object. Resolvers receive this safe snapshot, never the live proxy.
</p>
<p class="text-(--color-text-secondary)">
	The result: full SSR support with no
	<code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>"Cannot read page.params outside rendering"</code
	> errors, and no leaked state between requests — the route index holds only build-static loaders and
	registered resolvers.
</p>

<h2 class="text-(--color-text-primary)">Reactive tracking</h2>
<p class="text-(--color-text-secondary)">
	Because the <code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> reads happen
	synchronously inside the call, wrapping it in
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived(await getCrumbs())</code> makes
	navigation a tracked dependency — the trail re-resolves whenever the route changes, with no
	polling. On the client, Svelte's async-derived tracking also reaches into the resolvers
	themselves: if a resolver calls a reactive query (like SvelteKit's
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">query()</code>), the signal is tracked and
	the breadcrumbs automatically re-resolve when it changes — including optimistic updates via
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code>.
</p>

<h2 class="text-(--color-text-primary)">Performance</h2>

<h3 class="text-(--color-text-primary)">Bundle size</h3>
<p class="text-(--color-text-secondary)">
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">import.meta.glob</code> runs in
	<strong>non-eager</strong> mode, so Vite code-splits each page module as usual and the index holds
	only lazy loader references. To be clear about the cost: when a breadcrumb trail resolves, the
	modules it imports are the <code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>+page.svelte</code
	>
	modules <em>along the current path</em> — the same chunks SvelteKit's router loads to render those
	pages anyway. Routes you never visit and that never appear in a trail cost nothing: their modules are
	never requested.
</p>

<h3 class="text-(--color-text-primary)">Runtime cost</h3>
<ul class="text-(--color-text-secondary)">
	<li>
		<strong>Startup</strong> — building the route index is a synchronous loop over the glob keys.
		String work only; no modules load until a trail needs them.
	</li>
	<li>
		<strong>Navigation</strong> — the segment walk is a synchronous loop over the matched route id
		(O(depth)), and every resolver lookup is an exact
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">Map</code> hit. Module loads are memoized,
		so revisiting a path awaits already-resolved promises.
	</li>
	<li>
		<strong>Re-renders</strong> — the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived</code> only re-evaluates when a
		tracked dependency changes: the route, the pathname, or a query signal used by a resolver. No polling,
		no intervals.
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
	<a href={resolve('/playground')} class="text-(--color-accent) hover:underline">Playground</a>.
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

<h3 class="text-(--color-text-primary)">Internationalized routes</h3>
<p class="text-(--color-text-secondary)">
	Strip a locale prefix with <code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>transformPath</code
	>, or let an optional
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[[lang]]</code> segment pick a translated
	label. See
	<a href={resolve('/docs/i18n')} class="text-(--color-accent) hover:underline"
		>Internationalized routes</a
	>.
</p>

<h3 class="text-(--color-text-primary)">No breadcrumb</h3>
<p class="text-(--color-text-secondary)">
	Omit the export entirely — the route is silently skipped in the breadcrumb trail. See <a
		href={resolve('/about')}
		class="text-(--color-accent) hover:underline">About</a
	>.
</p>
