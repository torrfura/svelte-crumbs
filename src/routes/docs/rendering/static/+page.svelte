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
	The simplest rendering: an
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">&#123;#each&#125;</code> loop, no transitions.
	Toggle "Animate breadcrumbs" in the sidebar to compare.
</p>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Basic example</h2>
<p class="mt-1 text-(--color-text-secondary)">
	Link every segment except the last; mark that one as the current page.
</p>
<CodeBlock
	lang="svelte"
	raw
	code={`<` +
		`script lang="ts">
  import { getCrumbs } from 'svelte-crumbs';

  const crumbs = $derived(await getCrumbs());
</` +
		`script>

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
</nav>`}
/>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">With icons</h2>
<p class="mt-1 text-(--color-text-secondary)">
	A crumb can carry an <code class="rounded bg-(--color-code-bg) px-1 text-sm">icon</code> — a Svelte
	component returned from the resolver. Render it beside the label.
</p>
<CodeBlock
	lang="svelte"
	raw
	code={`<nav aria-label="Breadcrumbs" class="flex items-center gap-2 text-sm">
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
</nav>`}
/>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Custom separators</h2>
<p class="mt-1 text-(--color-text-secondary)">
	You own the markup: arrows, chevrons, dots, custom SVGs.
</p>
<CodeBlock
	lang="svelte"
	raw
	code={`{#each crumbs as crumb, i (crumb.url)}
  {#if i > 0}
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  {/if}
  <a href={crumb.url}>{crumb.label}</a>
{/each}`}
/>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">The crumbs array</h2>
<p class="mt-1 text-(--color-text-secondary)">Each entry has this shape:</p>
<CodeBlock
	lang="ts"
	raw
	code={`type Breadcrumb = {
  label: string;       // resolved display text
  url: string;         // the URL path for this segment
  icon?: Component;    // optional Svelte component
};`}
/>
