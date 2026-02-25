<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Rendering'
	});
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Rendering</h1>
<p class="mt-2 text-(--color-text-secondary)">
	svelte-crumbs is a headless library — it resolves breadcrumb data into a reactive array and
	leaves rendering entirely up to you. Below are two suggested approaches for consuming the
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">crumbs</code> array.
</p>

<ul class="mt-4 space-y-2">
	<li>
		<a href="/docs/rendering/animated" class="text-(--color-accent) hover:underline">Animated</a>
		<span class="text-(--color-text-muted)">— smooth crossfade + flip transitions between navigation states</span>
	</li>
	<li>
		<a href="/docs/rendering/static" class="text-(--color-accent) hover:underline">Static</a>
		<span class="text-(--color-text-muted)">— simple flex row, no transitions, fully customizable markup</span>
	</li>
</ul>
