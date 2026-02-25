<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = {
		routes: {
			'/spread': async () => ({ label: 'Spread' }),
			'/spread/[...operator]': async (_page, url) => {
				const lastSegment = url.split('/').pop() ?? 'overview';
				return { label: lastSegment };
			}
		}
	};
</script>

<script lang="ts">
	import { page } from '$app/state';
	import CodeBlock from '$lib/components/code-block.svelte';

	const segments = $derived((page.params.operator ?? '').split('/').filter(Boolean));
</script>
<h1 class="text-2xl font-bold text-(--color-text-primary)">Spread Routes</h1>
<p class="mt-2 text-sm text-(--color-text-secondary)">
	A <code class="rounded bg-(--color-code-bg) px-1 text-sm">[...operator]</code> catch-all route that handles arbitrary depth.
	The breadcrumb label is derived from the last segment of the path.
</p>

<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Try these routes</h3>
<ul class="mt-4 space-y-1">
	<li><a href="/spread" class="text-(--color-accent) hover:underline">/spread</a></li>
	<li><a href="/spread/users" class="text-(--color-accent) hover:underline">/spread/users</a></li>
	<li><a href="/spread/users/42" class="text-(--color-accent) hover:underline">/spread/users/42</a></li>
	<li><a href="/spread/users/42/settings" class="text-(--color-accent) hover:underline">/spread/users/42/settings</a></li>
</ul>

{#if segments.length}
	<p class="mt-4 text-sm text-(--color-text-secondary)">
		Current path: <code class="rounded bg-(--color-code-bg) px-1 text-sm">{segments.join(' / ')}</code>
	</p>
{/if}

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Multi-route breadcrumb from a single page</h2>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	Instead of exporting a single resolver, the <code class="rounded bg-(--color-code-bg) px-1 text-sm">breadcrumb</code> export uses the
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">{"{ routes }"}</code> form to define resolvers for multiple route patterns from one file.
</p>
<CodeBlock code={`export const breadcrumb: BreadcrumbMeta = {
  routes: {
    '/spread': async () => ({ label: 'Spread' }),
    '/spread/[...operator]': async (_page, url) => {
      // url is the breadcrumb's own path, e.g. "/spread/users/42"
      const lastSegment = url.split('/').pop() ?? 'overview';
      return { label: lastSegment };
    }
  }
};`} />

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">How it works</h2>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	A <code class="rounded bg-(--color-code-bg) px-1 text-sm">[...operator]</code> spread route matches paths of any depth.
	The resolver receives the breadcrumb's own URL as the second argument, so each segment gets the correct label
	(e.g. the breadcrumb at <code class="rounded bg-(--color-code-bg) px-1 text-sm">/spread/users/42</code> receives that exact path,
	not the full <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.params</code>). This is useful for routes where the depth
	is not known ahead of time — file browsers, nested categories, or operator trees.
</p>
