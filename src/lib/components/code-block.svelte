<script lang="ts">
	import { codeToHtml } from 'shiki';
	import { getTheme } from '$lib/stores/theme.svelte.js';

	let { code, lang = 'ts', raw = false }: { code: string; lang?: string; raw?: boolean } = $props();

	const theme = $derived(getTheme());

	function wrap(inner: string): string {
		const indented = inner
			.split('\n')
			.map((line) => '\t' + line)
			.join('\n');
		return '<' + 'script module lang="ts">\n' + indented + '\n</' + 'script>';
	}

	const input = $derived(raw ? code : wrap(code));
	const shikiTheme = $derived(theme === 'dark' ? 'github-dark' : 'github-light');

	let html = $state('');

	$effect(() => {
		codeToHtml(input, { lang, theme: shikiTheme }).then((result) => {
			html = result;
		});
	});
</script>

<div class="mt-4 overflow-x-auto rounded-lg border border-(--color-border) text-sm [&_pre]:p-4">
	<!-- Shiki markup, generated from repo-authored samples — never user input. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>
