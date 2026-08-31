<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Rendering'
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Rendering</h1>
<p class="mt-2 text-(--color-text-secondary)">
	svelte-crumbs is headless: it resolves the trail into a reactive
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">crumbs</code> array and leaves the markup to
	you. Two approaches:
</p>

<ul class="mt-4 space-y-2">
	<li>
		<a href={resolve('/docs/rendering/animated')} class="text-(--color-accent) hover:underline"
			>Animated</a
		>
		<span class="text-(--color-text-muted)">— crossfade and flip transitions between routes</span>
	</li>
	<li>
		<a href={resolve('/docs/rendering/static')} class="text-(--color-accent) hover:underline"
			>Static</a
		>
		<span class="text-(--color-text-muted)">— a flex row, no transitions</span>
	</li>
</ul>
