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

	const html = $derived(
		await codeToHtml(raw ? code : wrap(code), {
			lang,
			theme: theme === 'dark' ? 'github-dark' : 'github-light'
		})
	);
</script>

<div class="mt-4 overflow-x-auto rounded-lg border border-(--color-border) text-sm [&_pre]:p-4">
	{@html html}
</div>
