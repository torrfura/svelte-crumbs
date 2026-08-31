<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	const labels: Record<string, string> = {
		en: 'Greetings',
		sv: 'Hälsningar'
	};

	export const breadcrumb: BreadcrumbMeta = async (page) => ({
		label: labels[page.params.lang ?? 'en'] ?? labels.en
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getCrumbs } from '$lib/index.js';
	import CodeBlock from '$lib/components/code-block.svelte';

	const lang = $derived(page.params.lang ?? 'en');
	const crumbs = $derived(await getCrumbs());
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Optional-param i18n</h1>
<p class="mt-2 text-(--color-text-secondary)">
	This page lives at <code class="rounded bg-(--color-code-bg) px-1 text-sm">/i18n/[[lang]]</code> —
	the locale is an <em>optional</em> route parameter, so the same page serves both
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/i18n</code> and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/i18n/sv</code>. The breadcrumb resolver
	reads <code class="rounded bg-(--color-code-bg) px-1 text-sm">page.params.lang</code> to pick a translated
	label — no options needed.
</p>

<h3 class="mt-6 text-base font-semibold text-(--color-text-primary)">Try both languages</h3>
<ul class="mt-4 space-y-1">
	<li>
		<a href={resolve('/i18n/[[lang]]', {})} class="text-(--color-accent) hover:underline">/i18n</a>
		<span class="text-(--color-text-muted)">— default (English)</span>
	</li>
	<li>
		<a
			href={resolve('/i18n/[[lang]]', { lang: 'sv' })}
			class="text-(--color-accent) hover:underline">/i18n/sv</a
		>
		<span class="text-(--color-text-muted)">— Swedish</span>
	</li>
</ul>

<p class="mt-4 text-(--color-text-secondary)">
	Current language: <code class="rounded bg-(--color-code-bg) px-1 text-sm">{lang}</code>
	{#if page.params.lang === undefined}
		<span class="text-(--color-text-muted)">(param absent — fell back to the default)</span>
	{/if}
</p>
<p class="mt-2 text-(--color-text-secondary)">
	Current trail: <code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>{crumbs.map((crumb) => crumb.label).join(' / ')}</code
	>
</p>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">The breadcrumb export</h2>
<p class="mt-1 text-(--color-text-secondary)">
	When the param is absent the crumb still resolves — a <code
		class="rounded bg-(--color-code-bg) px-1 text-sm">[[lang]]</code
	>
	segment consumes zero or one URL segments, and the crumb's URL is the concrete pathname either way,
	so the trail keeps pointing at the language you are on.
</p>
<CodeBlock
	code={`const labels: Record<string, string> = {
  en: 'Greetings',
  sv: 'Hälsningar'
};

export const breadcrumb: BreadcrumbMeta = async (page) => ({
  label: labels[page.params.lang ?? 'en'] ?? labels.en
});`}
/>

<p class="mt-4 text-(--color-text-secondary)">
	For locale-<em>prefix</em> apps (Paraglide &amp; friends) see the
	<a href={resolve('/docs/i18n')} class="text-(--color-accent) hover:underline"
		>Internationalized routes</a
	> docs.
</p>
