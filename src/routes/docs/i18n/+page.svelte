<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'i18n'
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import CodeBlock from '$lib/components/code-block.svelte';
</script>

<h1 class="text-(--color-text-primary)">Internationalized routes</h1>
<p class="text-(--color-text-secondary)">
	Two common i18n routing styles, and how svelte-crumbs handles each: locale-prefixed URLs handled
	outside the router (Paraglide &amp; friends), and locale segments modelled as an optional
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[[lang]]</code> route parameter.
</p>

<h2 class="text-(--color-text-primary)">Locale-prefix apps (Paraglide &amp; friends)</h2>
<p class="text-(--color-text-secondary)">
	Libraries like Paraglide serve <code class="rounded bg-(--color-code-bg) px-1 text-sm"
		>/sv/products/42</code
	>
	from the route <code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/[id]</code> — the
	locale prefix exists in the URL but not in the route id, so the pathname and the route no longer line
	up segment by segment. Pass
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">transformPath</code> to strip the prefix
	before matching:
</p>
<CodeBlock
	lang="svelte"
	code={`<` +
		`script lang="ts">
  import { getCrumbs } from 'svelte-crumbs';
  import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';

  const crumbs = $derived(
    await getCrumbs({ transformPath: ({ pathname }) => deLocalizeHref(pathname) })
  );
</` +
		`script>

{#each crumbs as crumb, i (crumb.url)}
  {#if i > 0}<span aria-hidden="true">/</span>{/if}
  <a href={localizeHref(crumb.url)}>{crumb.label}</a>
{/each}`}
/>
<p class="text-(--color-text-secondary)">
	Matching now runs entirely in de-localized route space. That has two consequences worth knowing:
</p>
<ul class="text-(--color-text-secondary)">
	<li>
		<strong>Resolvers see de-localized paths</strong> — the
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">page</code> snapshot passed to each
		resolver is rebuilt around the transformed pathname, and each
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">crumb.url</code> is a de-localized
		prefix like <code class="rounded bg-(--color-code-bg) px-1 text-sm">/products/42</code>.
	</li>
	<li>
		<strong>Re-localize at render</strong> — since
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">crumb.url</code> has no locale prefix,
		wrap it when rendering the link:
		<code class="rounded bg-(--color-code-bg) px-1 text-sm">localizeHref(crumb.url)</code>. That
		keeps visitors on their language when they click a crumb.
	</li>
</ul>
<p class="text-(--color-text-secondary)">
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">transformPath</code> gets the same error
	isolation as resolvers: if it throws, the error is logged and the untransformed pathname is used,
	so a broken transform degrades the trail instead of breaking the page. A falsy return value
	(<code class="rounded bg-(--color-code-bg) px-1 text-sm">''</code>) is normalized to
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">'/'</code>, and a missing leading slash is
	added for you.
</p>

<h2 class="text-(--color-text-primary)">Optional-param routing with [[lang]]</h2>
<p class="text-(--color-text-secondary)">
	If the locale lives in your route tree instead — <code
		class="rounded bg-(--color-code-bg) px-1 text-sm">/i18n/[[lang]]</code
	>
	— no options are needed: optional parameters work out of the box. The walk knows a
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">[[lang]]</code> segment consumes zero or one
	pathname segments (it checks
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">page.params</code>), so both
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/i18n</code> and
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">/i18n/sv</code> produce a correct trail. The
	resolver reads
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">page.params.lang</code> to pick a translated
	label:
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
<p class="text-(--color-text-secondary)">
	Here <code class="rounded bg-(--color-code-bg) px-1 text-sm">crumb.url</code> is the concrete
	pathname prefix — locale segment included — so no re-localization step is needed when rendering.
	Try it on the
	<a href={resolve('/i18n/[[lang]]', {})} class="text-(--color-accent) hover:underline"
		>live demo page</a
	>: switch between the default language and Swedish and watch the crumb in the top bar change.
</p>
