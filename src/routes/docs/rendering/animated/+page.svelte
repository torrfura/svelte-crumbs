<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Animated'
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Animated breadcrumbs</h1>
<p class="mt-2 text-(--color-text-secondary)">
	Render the <code class="rounded bg-(--color-code-bg) px-1 text-sm">crumbs</code> array with
	Svelte's built-in <code class="rounded bg-(--color-code-bg) px-1 text-sm">crossfade</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">fly</code> and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">flip</code>. This is what drives the
	breadcrumb bar above — toggle "Animate breadcrumbs" in the sidebar to watch it.
</p>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Full example</h2>
<p class="mt-1 text-(--color-text-secondary)">
	Crumbs sit in a CSS grid, one column each, so
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">flip</code> can reposition the ones that
	stay while <code class="rounded bg-(--color-code-bg) px-1 text-sm">crossfade</code> pairs those
	entering and leaving. A staggered
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">fly</code> fallback covers crumbs with no counterpart.
</p>
<CodeBlock
	lang="svelte"
	raw
	code={`<` +
		`script lang="ts">
  import { crossfade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { onMount } from 'svelte';
  import { createBreadcrumbs } from 'svelte-crumbs';

  const getBreadcrumbs = createBreadcrumbs();
  const crumbs = $derived(await getBreadcrumbs());

  let mounted = $state(false);
  onMount(() => { mounted = true; });

  let count = $derived(crumbs.length);
  let prevCount = $derived(crumbs.length);
  $effect.pre(() => {
    prevCount = count;
    count = crumbs.length;
  });

  const DURATION = 200;
  const STAGGER = 60;

  const [send, receive] = crossfade({
    duration: 200,
    fallback(node, _params, intro) {
      if (!mounted) return { duration: 0 };
      const i = parseInt(node.getAttribute('data-i') ?? '0');
      const outTotal = (prevCount - 1) * STAGGER + DURATION;
      const delay = intro
        ? outTotal + i * STAGGER
        : Math.max(0, prevCount - 1 - i) * STAGGER;
      return fly(node, intro
        ? { x: -4, duration: DURATION, delay }
        : { y: 4, duration: DURATION, delay });
    }
  });
</` +
		`script>

<nav
  aria-label="Breadcrumbs"
  class="grid auto-cols-auto items-center gap-2 text-sm"
>
  {#each crumbs as crumb, i (crumb.url)}
    <span
      class="inline-flex items-center gap-2"
      data-i={i}
      style:grid-column={i + 1}
      style:grid-row="1"
      in:receive={{ key: crumb.url }}
      out:send={{ key: crumb.url }}
      animate:flip={{ duration: 150, delay: 150 }}
    >
      {#if i > 0}
        <span aria-hidden="true">/</span>
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

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">How it works</h2>
<ul class="mt-2 space-y-2 text-(--color-text-secondary)">
	<li>
		<strong>Grid layout</strong> — each crumb is pinned to a column, so
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">flip</code> animates position changes as crumbs
		come and go.
	</li>
	<li>
		<strong>Crossfade</strong> — a crumb in both the old and new trail morphs in place. Unmatched
		crumbs fall back to <code class="rounded bg-(--color-code-bg) px-1 text-sm">fly</code>.
	</li>
	<li>
		<strong>Staggered timing</strong> — outgoing crumbs leave last-first, then incoming crumbs arrive
		in order. The result cascades.
	</li>
	<li>
		<strong>SSR safe</strong> — the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">mounted</code> guard keeps transitions client-side.
	</li>
</ul>
