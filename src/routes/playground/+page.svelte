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

<h1 class="text-2xl font-bold text-gray-900">Playground</h1>
<p class="mt-2 text-gray-600">
	Type a name and press Save — the breadcrumb updates via optimistic update.
</p>

<form
	class="mt-6 flex items-end gap-3"
	onsubmit={(e) => {
		e.preventDefault();
		save();
	}}
>
	<div>
		<label for="nickname" class="block text-sm font-medium text-gray-700">Your name</label>
		<input
			id="nickname"
			type="text"
			bind:value={input}
			placeholder="Visitor"
			autocomplete="off"
			class="mt-1 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		/>
	</div>
	<button
		type="submit"
		class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
	>
		Save
	</button>
</form>

<h2 class="mt-8 text-lg font-semibold text-gray-800">Breadcrumb reads from a remote query</h2>
<p class="mt-1 text-sm text-gray-500">
	The breadcrumb calls <code class="rounded bg-gray-100 px-1 text-sm">getNickname()</code> — a
	server-side query faking a database read.
	<br /><br />
	Try changing the name and make a hard reload of the page.
</p>
<CodeBlock
	code={`import { getNickname } from '$lib/demo/greeting.remote.js';

export const breadcrumb: BreadcrumbMeta = async () => ({
  label: await getNickname()
});`}
/>

<h2 class="mt-6 text-lg font-semibold text-gray-800">Optimistic update via command</h2>
<p class="mt-1 text-sm text-gray-500">
	On save, a <code class="rounded bg-gray-100 px-1 text-sm">command</code> writes to the server
	while
	<code class="rounded bg-gray-100 px-1 text-sm">.withOverride()</code> updates the breadcrumb instantly
	— no round-trip.
</p>
<CodeBlock
	code={`function save() {
  setNickname(input).updates(getNickname().withOverride(() => input || 'Visitor'));
}`}
	lang="ts"
/>
