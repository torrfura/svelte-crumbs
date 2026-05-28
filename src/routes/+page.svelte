<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Svelte Crumbs'
	});
</script>

<script lang="ts">
	import CodeBlock from '$lib/components/code-block.svelte';
	import BrandMark from '$lib/components/brand-mark.svelte';
</script>

<!-- ────────────────────────────────── HERO ────────────────────────────────── -->
<section class="mx-auto flex flex-col items-center pt-12 pb-16 text-center">
	<BrandMark />

	<p class="mt-20 max-w-xl text-lg text-(--color-text-secondary)">
		Automatic, SSR-ready breadcrumbs for SvelteKit.
		<br />
		<span class="text-(--color-text-muted)">Zero config. Async-aware. Fully reactive.</span>
	</p>

	<div class="mt-18 flex flex-wrap items-center justify-center gap-3">
		<a
			href="/docs/getting-started"
			class="inline-flex items-center gap-2 rounded-lg bg-(--logo-dot) px-5 py-2.5 text-sm font-semibold text-(--color-bg) shadow-sm transition hover:opacity-90"
		>
			Get started
			<span aria-hidden="true">→</span>
		</a>
		<a
			href="https://github.com/torrfura/svelte-crumbs"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-semibold text-(--color-text-primary) transition hover:bg-(--color-code-bg)"
		>
			GitHub
		</a>
	</div>
</section>

<!-- ────────────────────────────── FEATURE CARDS ────────────────────────────── -->
<section class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
	<div class="rounded-xl border border-(--color-border) p-5">
		<div class="text-2xl">🪄</div>
		<h3 class="mt-3 text-base font-semibold text-(--color-text-primary)">Zero config</h3>
		<p class="mt-1 text-sm text-(--color-text-secondary)">
			Drop in, export a <code class="rounded bg-(--color-code-bg) px-1 text-xs">breadcrumb</code> from
			any page, and you're done.
		</p>
	</div>
	<div class="rounded-xl border border-(--color-border) p-5">
		<div class="text-2xl">⚡</div>
		<h3 class="mt-3 text-base font-semibold text-(--color-text-primary)">SSR-ready</h3>
		<p class="mt-1 text-sm text-(--color-text-secondary)">
			Resolves during top-level <code class="rounded bg-(--color-code-bg) px-1 text-xs">await</code
			>. No
			<code class="rounded bg-(--color-code-bg) px-1 text-xs">{`{#await}`}</code> blocks, no flashes.
		</p>
	</div>
	<div class="rounded-xl border border-(--color-border) p-5">
		<div class="text-2xl">🔁</div>
		<h3 class="mt-3 text-base font-semibold text-(--color-text-primary)">Reactive</h3>
		<p class="mt-1 text-sm text-(--color-text-secondary)">
			Async resolvers, remote functions, optimistic queries — all tracked.
		</p>
	</div>
</section>

<!-- ───────────────────────────── 30-SECOND DEMO ──────────────────────────── -->
<section class="mt-28">
	<h2 class="text-xl font-semibold text-(--color-text-primary)">In 30 seconds</h2>
	<p class="mt-2 text-(--color-text-secondary)">One line in your layout. One export per page.</p>

	<div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<div class="text-xs font-semibold tracking-wide text-(--color-text-muted) uppercase">
				+layout.svelte
			</div>
			<div class="mt-1">
				<CodeBlock
					lang="svelte"
					code={`<` +
						`script>
  import { createBreadcrumbs } from 'svelte-crumbs';
  const getBreadcrumbs = createBreadcrumbs();
  const crumbs = $derived(await getBreadcrumbs());
</` +
						`script>

{#each crumbs as crumb, i}
  {#if i > 0} / {/if}
  <a href={crumb.url}>{crumb.label}</a>
{/each}`}
				/>
			</div>
		</div>

		<div>
			<div class="text-xs font-semibold tracking-wide text-(--color-text-muted) uppercase">
				any +page.svelte
			</div>
			<div class="mt-1">
				<CodeBlock
					lang="svelte"
					code={`<` +
						`script module>
  export const breadcrumb = async (page) => ({
    label: page.data.product.name
  });
</` +
						`script>`}
				/>
			</div>
		</div>
	</div>
</section>

<!-- ───────────────────────────── TRY IT LIVE ─────────────────────────────── -->
<section class="mt-16">
	<h2 class="text-xl font-semibold text-(--color-text-primary)">Try it live</h2>
	<p class="mt-2 text-(--color-text-secondary)">
		Click through these routes and watch the breadcrumbs above update in real time.
	</p>

	<div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
		<a
			href="/products/42"
			class="group rounded-xl border border-(--color-border) p-4 transition hover:border-(--logo-primary)"
		>
			<div class="text-sm font-mono text-(--color-text-secondary)">/products/42</div>
			<div class="mt-1 text-sm text-(--color-text-muted)">Dynamic label from load data</div>
		</a>
		<a
			href="/docs/getting-started"
			class="group rounded-xl border border-(--color-border) p-4 transition hover:border-(--logo-primary)"
		>
			<div class="text-sm font-mono text-(--color-text-secondary)">/docs/getting-started</div>
			<div class="mt-1 text-sm text-(--color-text-muted)">Remote function resolver</div>
		</a>
		<a
			href="/spread/users/42/settings"
			class="group rounded-xl border border-(--color-border) p-4 transition hover:border-(--logo-primary)"
		>
			<div class="text-sm font-mono text-(--color-text-secondary)">/spread/users/42/settings</div>
			<div class="mt-1 text-sm text-(--color-text-muted)">
				Catch-all <code>[...rest]</code> route
			</div>
		</a>
		<a
			href="/playground"
			class="group rounded-xl border border-(--color-border) p-4 transition hover:border-(--logo-primary)"
		>
			<div class="text-sm font-mono text-(--color-text-secondary)">/playground</div>
			<div class="mt-1 text-sm text-(--color-text-muted)">Optimistic updates</div>
		</a>
	</div>
</section>

<!-- ──────────────────────────── DEEP DIVE LINK ───────────────────────────── -->
<section class="mt-16 mb-8 rounded-xl border border-dashed border-(--color-border) p-6 text-center">
	<p class="text-sm text-(--color-text-secondary)">
		Curious about the internals — module scanning, SSR safety, reactive tracking?
	</p>
	<a
		href="/docs/internals"
		class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-(--color-accent) hover:underline"
	>
		Read how it works
		<span aria-hidden="true">→</span>
	</a>
</section>
