<script lang="ts">
	import { codeToHtml } from 'shiki';
	import { getTheme } from '$lib/stores/theme.svelte.js';

	let {
		code,
		lang = 'ts',
		raw = false,
		bare = false
	}: { code: string; lang?: string; raw?: boolean; bare?: boolean } = $props();

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
		let stale = false;
		codeToHtml(input, { lang, theme: shikiTheme }).then((result) => {
			if (!stale) html = result;
		});
		return () => {
			stale = true;
		};
	});
</script>

<div
	class={[
		'overflow-x-auto text-sm [&_pre]:p-4',
		bare
			? '[&_pre]:!bg-transparent [&_pre]:p-[22px] [&_pre]:text-[13px] [&_pre]:leading-[1.9]'
			: 'mt-4 rounded-lg border border-(--color-border)'
	]}
>
	<!-- Shiki markup, generated from repo-authored samples — never user input. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>
