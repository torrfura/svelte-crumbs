<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Static'
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Static breadcrumbs</h1>
<p class="mt-2 text-(--color-text-secondary)">
	svelte-crumbs is headless — it gives you a reactive
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">crumbs</code> array and leaves rendering
	entirely up to you. The simplest approach is a plain
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">{'{'}#each{'}'}</code> loop with no
	transitions. Toggle "Animate breadcrumbs" in the sidebar to compare with the animated version.
</p>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Basic example</h2>
<p class="mt-1 text-(--color-text-secondary)">
	Iterate over the crumbs array, render links for intermediate segments, and mark the last segment
	as the current page.
</p>
<CodeBlock lang="svelte" code={`<` + `script lang="ts">
  import { createBreadcrumbs } from 'svelte-crumbs';

  const getBreadcrumbs = createBreadcrumbs();
  const crumbs = $derived(await getBreadcrumbs());
</` + `script>

<nav aria-label="Breadcrumbs" class="flex items-center gap-2 text-sm">
  {#each crumbs as crumb, i (crumb.url)}
    {#if i > 0}
      <span aria-hidden="true">/</span>
    {/if}
    {#if i < crumbs.length - 1 || crumbs.length === 1}
      <a href={crumb.url}>{crumb.label}</a>
    {:else}
      <span aria-current="page">{crumb.label}</span>
    {/if}
  {/each}
</nav>`} />

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">With icons</h2>
<p class="mt-1 text-(--color-text-secondary)">
	Each crumb can optionally include an
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">icon</code> — a Svelte component you
	return from your breadcrumb resolver. Render it alongside the label.
</p>
<CodeBlock lang="svelte" code={`<nav aria-label="Breadcrumbs" class="flex items-center gap-2 text-sm">
  {#each crumbs as crumb, i (crumb.url)}
    {#if i > 0}
      <span aria-hidden="true">/</span>
    {/if}
    <span class="inline-flex items-center gap-1">
      {#if crumb.icon}
        {@const Icon = crumb.icon}
        <Icon />
      {/if}
      {#if i < crumbs.length - 1 || crumbs.length === 1}
        <a href={crumb.url}>{crumb.label}</a>
      {:else}
        <span aria-current="page">{crumb.label}</span>
      {/if}
    </span>
  {/each}
</nav>`} />

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Custom separators</h2>
<p class="mt-1 text-(--color-text-secondary)">
	Since you own the markup, use any separator you like — arrows, chevrons, dots, or custom SVGs.
</p>
<CodeBlock lang="svelte" code={`{#each crumbs as crumb, i (crumb.url)}
  {#if i > 0}
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  {/if}
  <a href={crumb.url}>{crumb.label}</a>
{/each}`} />

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">The crumbs array</h2>
<p class="mt-1 text-(--color-text-secondary)">
	Each entry in the array has the following shape:
</p>
<CodeBlock lang="ts" code={`type Breadcrumb = {
  label: string;       // resolved display text
  url: string;         // the URL path for this segment
  icon?: Component;    // optional Svelte component
};`} />
