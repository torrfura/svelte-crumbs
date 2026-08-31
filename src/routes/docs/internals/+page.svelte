<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'How it works'
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1 class="text-(--color-text-primary)">How svelte-crumbs works</h1>
<p class="text-(--color-text-secondary)">
	What runs, when it runs, and why it is safe on the server.
</p>

<h2 class="text-(--color-text-primary)">Architecture</h2>

<h3 class="text-(--color-text-primary)">1. Module scanning</h3>
<p class="text-(--color-text-secondary)">
	At startup, <code class="rounded bg-(--color-code-bg) px-1 text-sm">buildBreadcrumbMap()</code>
	calls
	<code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>import.meta.glob('/src/routes/**/+page.svelte')</code
	>
	in <strong>non-eager</strong> mode. Vite returns one lazy loader per page file — no component code is
	imported yet, only paths.
</p>
<p class="text-(--color-text-secondary)">
	The loaders run in parallel via <code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>Promise.all</code
	>, and only the module-level
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> export is read. Pages without
	one are skipped. The result is a flat map of route patterns to resolvers.
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
	looked up by exact match, then
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[param]</code>, then
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[...spread]</code>
	—
	<strong>synchronously</strong>.
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
	SvelteKit's <code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> proxy is bound to
	the request through component context, so reading it after an
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">await</code> on the server throws — the rendering
	context is gone by then. Two defences:
</p>
<ul class="text-(--color-text-secondary)">
	<li>
		<strong>Snapshot before await</strong> —
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> state is copied into a plain
		object <em>synchronously</em>, before the one-time
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">await ready</code> that loads modules on first
		render. Resolvers get the snapshot, never the live proxy.
	</li>
	<li>
		<strong
			>Cached pathname via <code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived</code
			></strong
		>
		— the route resolver reads a cached
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived(page.url.pathname)</code>
		evaluated inside the rendering context. Past the await boundary, Svelte replays the cached value instead
		of touching the proxy.
	</li>
</ul>
<p class="text-(--color-text-secondary)">
	The result: SSR with no
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
	>, so Svelte's fine-grained tracking reaches inside every resolver. A reactive query (SvelteKit's
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">query()</code>) is tracked, and the trail
	re-resolves when it changes — optimistic
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code> included.
</p>

<h2 class="text-(--color-text-primary)">Performance</h2>

<h3 class="text-(--color-text-primary)">Bundle size</h3>
<p class="text-(--color-text-secondary)">
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">import.meta.glob</code> runs
	<strong>non-eager</strong>, so Vite code-splits every page module. The map pulls in the
	module-level <code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> export, not the
	component tree.
</p>

<h3 class="text-(--color-text-primary)">Runtime cost</h3>
<ul class="text-(--color-text-secondary)">
	<li>
		<strong>Startup</strong> — modules load in parallel via
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">Promise.all</code>, once, before first
		render.
	</li>
	<li>
		<strong>Navigation</strong> — a synchronous loop. Static patterns hit an O(1) map; dynamic ones are
		precompiled and cached per route. Sub-millisecond in practice.
	</li>
	<li>
		<strong>Re-renders</strong> — the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">$derived</code> re-evaluates only when
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">page.url.pathname</code> changes or a tracked
		query fires. No polling.
	</li>
</ul>

<h2 class="text-(--color-text-primary)">Patterns</h2>
<p class="text-(--color-text-secondary)">
	Every resolver pattern — static, load data, remote function, optimistic update, spread routes, no
	breadcrumb — lives in the <a
		href={resolve('/docs/[slug]', { slug: 'api-reference' })}
		class="text-(--color-accent) hover:underline">API reference</a
	>.
</p>
