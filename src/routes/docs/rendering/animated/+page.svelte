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
	svelte-crumbs is headless — it gives you a reactive
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">crumbs</code> array and leaves rendering
	entirely up to you. Below is a suggested approach for rendering breadcrumbs with smooth
	transitions using Svelte's built-in
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">crossfade</code>,
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">fly</code>, and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">flip</code>.
	This is exactly what powers the breadcrumb bar in this demo site — toggle "Animate breadcrumbs"
	in the sidebar to see it in action.
</p>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Full example</h2>
<p class="mt-1 text-(--color-text-secondary)">
	The key idea is to render crumbs in a CSS grid (one column per crumb) so that Svelte's
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">flip</code> animation can smoothly
	reposition crumbs that stay visible, while
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">crossfade</code> pairs entering and
	leaving crumbs. A staggered
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">fly</code> fallback handles crumbs that
	have no matching counterpart.
</p>
<CodeBlock lang="svelte" code={`<` + `script lang="ts">
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
</` + `script>

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
</nav>`} />

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">How it works</h2>
<ul class="mt-2 space-y-2 text-(--color-text-secondary)">
	<li>
		<strong>Grid layout</strong> — each crumb is pinned to a grid column, so
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">flip</code> can animate position changes
		when crumbs are added or removed.
	</li>
	<li>
		<strong>Crossfade</strong> — when a crumb exists in both the old and new trail, crossfade
		morphs it in place. For crumbs without a match, the fallback
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">fly</code> transition kicks in.
	</li>
	<li>
		<strong>Staggered timing</strong> — outgoing crumbs fly out with a reverse stagger (last
		crumb first), then incoming crumbs fly in sequentially. This creates a smooth cascading effect.
	</li>
	<li>
		<strong>SSR safe</strong> — the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">mounted</code> guard ensures
		transitions only run client-side.
	</li>
</ul>
