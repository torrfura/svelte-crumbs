<script lang="ts" module>
	import type { BreadcrumbMeta } from '$lib/index.js';
	import { getNickname } from '$lib/demo/greeting.remote.js';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: await getNickname()
	});
</script>

<script lang="ts">
	import { setNickname } from '$lib/demo/greeting.remote.js';
	import CodeBlock from '$lib/components/code-block.svelte';

	let input = $state('');

	function save() {
		setNickname(input).updates(getNickname().withOverride(() => input || 'Visitor'));
	}
</script>

<h1 class="text-2xl font-bold text-(--color-text-primary)">Reactive Updates</h1>
<p class="mt-2 text-(--color-text-secondary)">
	Type a name and press Save — the breadcrumb updates via optimistic update.
	<br /><br />
	Try changing the name and make a hard reload of the page.
</p>

<form
	class="mt-6 flex items-end gap-3"
	onsubmit={(e) => {
		e.preventDefault();
		save();
	}}
>
	<div>
		<label for="nickname" class="block text-sm font-medium text-(--color-text-primary)">Your name</label>
		<input
			id="nickname"
			type="text"
			bind:value={input}
			placeholder="Visitor"
			autocomplete="off"
			class="mt-1 w-full max-w-xs rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-(--color-text-primary) shadow-sm focus:border-(--color-accent) focus:ring-1 focus:ring-(--color-accent) focus:outline-none"
		/>
	</div>
	<button
		type="submit"
		class="rounded-md bg-(--color-accent) px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:ring-2 focus:ring-(--color-accent) focus:ring-offset-2 focus:outline-none"
	>
		Save
	</button>
</form>

<h2 class="mt-8 text-lg font-semibold text-(--color-text-primary)">Breadcrumb reads from a remote query</h2>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	The breadcrumb calls <code class="rounded bg-(--color-code-bg) px-1 text-sm">getNickname()</code> — a
	server-side query faking a database read.
</p>
<CodeBlock
	code={`import { getNickname } from '$lib/demo/greeting.remote.js';

export const breadcrumb: BreadcrumbMeta = async () => ({
  label: await getNickname()
});`}
/>

<h2 class="mt-6 text-lg font-semibold text-(--color-text-primary)">Optimistic update via command</h2>
<p class="mt-1 text-sm text-(--color-text-secondary)">
	On save, a <code class="rounded bg-(--color-code-bg) px-1 text-sm">command</code> writes to the server
	while
	<code class="rounded bg-(--color-code-bg) px-1 text-sm">.withOverride()</code> updates the breadcrumb instantly
	— no round-trip.
</p>
<CodeBlock
	code={`function save() {
  setNickname(input).updates(getNickname().withOverride(() => input || 'Visitor'));
}`}
	lang="ts"
/>
