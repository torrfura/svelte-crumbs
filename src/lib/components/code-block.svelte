<script lang="ts">
	import { codeToHtml } from 'shiki';

	let { code, lang = 'ts' }: { code: string; lang?: string } = $props();

	function wrap(inner: string): string {
		const indented = inner
			.split('\n')
			.map((line) => '\t' + line)
			.join('\n');
		return '<' + 'script module lang="ts">\n' + indented + '\n</' + 'script>';
	}

	const html = $derived(await codeToHtml(wrap(code), { lang, theme: 'github-light' }));
</script>

<div class="p-4 mt-4 overflow-x-auto rounded-lg border border-gray-200 text-sm">
	{@html html}
</div>
