<script lang="ts" module>
	import { language as bash } from '@twinkleplop/bash';
	import { language as svelte } from '@twinkleplop/svelte';
	import { language as typescript } from '@twinkleplop/typescript';
	// Light tokens on :root, dark tokens under `.dark` — the class the theme store toggles.
	import '@twinkleplop/theme-github';

	const highlighters: Record<string, (input: string) => string> = {
		bash: bash(),
		svelte: svelte(),
		ts: typescript()
	};
</script>

<script lang="ts">
	let {
		code,
		lang = 'ts',
		raw = false,
		bare = false
	}: { code: string; lang?: string; raw?: boolean; bare?: boolean } = $props();

	function wrap(inner: string): string {
		const indented = inner
			.split('\n')
			.map((line) => '\t' + line)
			.join('\n');
		return '<' + 'script module lang="ts">\n' + indented + '\n</' + 'script>';
	}

	// Highlighting is synchronous, so blocks render on the server too.
	// Unwrapped samples are shown inside a Svelte module script.
	const html = $derived(
		raw ? (highlighters[lang] ?? highlighters.ts)(code) : highlighters.svelte(wrap(code))
	);
</script>

<div
	class={[
		'overflow-x-auto text-sm [&_pre]:p-4 [&_pre]:text-(--twp-identifier)',
		bare
			? '[&_pre]:p-[22px] [&_pre]:text-[13px] [&_pre]:leading-[1.9]'
			: 'mt-4 rounded-lg border border-(--color-border) [&_pre]:bg-(--twp-background)'
	]}
>
	<!-- twinkleplop markup, generated from repo-authored samples — never user input. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>
