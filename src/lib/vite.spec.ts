import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crumbs, extractBreadcrumbModule } from './vite.js';

const FILE = '/app/src/routes/products/+page.svelte';

const page = (moduleScript: string, lang = 'ts') =>
	`<script module lang="${lang}">\n${moduleScript}\n</script>\n\n<p>hi</p>\n`;

describe('extractBreadcrumbModule', () => {
	it('returns only the module script, keeping line numbers', () => {
		const source = [
			'<script module lang="ts">',
			"\timport { getProduct } from './data.remote';",
			"\texport const breadcrumb = async () => ({ label: 'Products' });",
			'</script>',
			'',
			'<script lang="ts">',
			"\timport Heavy from 'heavy-chart';",
			'</script>',
			'',
			'<Heavy />'
		].join('\n');

		const out = extractBreadcrumbModule(source, FILE);

		expect(out.split).toBe(true);
		expect(out.code).toContain('export const breadcrumb');
		expect(out.code).toContain('./data.remote');
		expect(out.code).not.toContain('heavy-chart');
		expect(out.code.split('\n').findIndex((l) => l.includes('export const breadcrumb'))).toBe(2);
	});

	it('supports legacy context="module" scripts', () => {
		const source =
			'<script context="module">export const breadcrumb = async () => ({ label: "A" });</script><p>hi</p>';
		expect(extractBreadcrumbModule(source, FILE).code).toContain('export const breadcrumb');
	});

	it('splits inert declarations: functions, types, objects of resolvers', () => {
		const out = extractBreadcrumbModule(
			page(`
	import type { BreadcrumbMeta } from 'svelte-crumbs';
	import { icons } from '$lib/icons';
	type Label = string;
	enum Kind { A }
	function label(): Label { return 'x'; }
	const PREFIX = \`crumb-\${1}\`;
	export const breadcrumb = {
		routes: {
			'/a': async () => ({ label: label(), icon: icons.Home }),
			'/b': async () => ({ label: PREFIX })
		}
	} satisfies BreadcrumbMeta;`),
			FILE
		);
		expect(out.split).toBe(true);
	});

	it.each([
		[
			'module-level let',
			'let count = 0;\nexport const breadcrumb = async () => ({ label: `${count}` });',
			'let count'
		],
		[
			'runes',
			'const s = $state({ n: 1 });\nexport const breadcrumb = async () => ({ label: `${s.n}` });',
			'`s`'
		],
		[
			'objects built at load',
			'const cache = new Map();\nexport const breadcrumb = async () => ({ label: `${cache.size}` });',
			'`cache`'
		],
		[
			'side effects',
			"console.log('hi');\nexport const breadcrumb = async () => ({ label: 'x' });",
			'runs code'
		]
	])('re-exports from the page when the module script has %s', (_, script, reason) => {
		const out = extractBreadcrumbModule(page(script), FILE);
		expect(out.split).toBe(false);
		expect(out.code).toBe('export { breadcrumb } from "./+page.svelte";\n');
		expect(out.reason).toContain(reason);
	});

	it('emits an empty module for pages without a breadcrumb', () => {
		expect(extractBreadcrumbModule('<script>let a = 1;</script><p>{a}</p>', FILE).code).toBe(
			'export {};\n'
		);
		expect(extractBreadcrumbModule('<p>no breadcrumb here</p>', FILE).code).toBe('export {};\n');
	});

	it('re-exports from the page when the module script is another language', () => {
		const out = extractBreadcrumbModule(page('breadcrumb = -> 1', 'coffee'), FILE);
		expect(out).toMatchObject({
			split: false,
			code: 'export { breadcrumb } from "./+page.svelte";\n'
		});
	});

	it('re-exports from the page when the markup does not parse', () => {
		const source = '<script module>export const breadcrumb = 1;</script>\n<div {#if}>';
		expect(
			extractBreadcrumbModule(source, 'C:\\app\\src\\routes\\+page@admin.svelte')
		).toMatchObject({
			split: false,
			code: 'export { breadcrumb } from "./+page@admin.svelte";\n'
		});
	});
});

describe('crumbs() plugin', () => {
	let root: string;
	type Ctx = { warn: ReturnType<typeof vi.fn>; addWatchFile: ReturnType<typeof vi.fn> };
	let ctx: Ctx;
	const plugin = crumbs();
	const load = (id: string) =>
		(plugin.load as unknown as (this: Ctx, id: string) => string | null).call(ctx, id);
	const resolveId = (source: string) =>
		(plugin.resolveId as unknown as (this: Ctx, source: string) => Promise<string | null>).call(
			ctx,
			source
		);

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), 'crumbs-')).replace(/\\/g, '/');
		(plugin.configResolved as (c: { root: string }) => void)({ root });
		ctx = { warn: vi.fn(), addWatchFile: vi.fn() };
		mkdirSync(join(root, 'src/routes/products'), { recursive: true });
		writeFileSync(
			join(root, 'src/routes/products/+page.svelte'),
			page("export const breadcrumb = async () => ({ label: 'Products' });")
		);
	});

	afterEach(() => rmSync(root, { recursive: true, force: true }));

	it('serves the split page-modules glob in place of the marked default', () => {
		const dir = join(root, 'node_modules/svelte-crumbs/dist/breadcrumbs/routing');
		mkdirSync(dir, { recursive: true });
		const file = join(dir, 'page-modules.js');
		writeFileSync(
			file,
			readFileSync(new URL('./breadcrumbs/routing/page-modules.ts', import.meta.url))
		);

		const code = load(file);

		expect(code).toContain(`query: '?breadcrumb'`);
	});

	it('leaves an unmarked page-modules file alone', () => {
		const dir = join(root, 'src/lib/breadcrumbs/routing');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'page-modules.ts'), 'export const mine = 1;');
		expect(load(join(dir, 'page-modules.ts'))).toBeNull();
	});

	it('resolves root-relative and Windows-style split ids to the page directory', async () => {
		const expected = `${root}/src/routes/products/+page.breadcrumb.svelte.ts`;
		expect(await resolveId('/src/routes/products/+page.breadcrumb.svelte.ts')).toBe(expected);
		expect(await resolveId(expected.replace(/\//g, '\\'))).toBe(expected);
		expect(await resolveId('/src/routes/missing/+page.breadcrumb.svelte.ts')).toBeNull();
	});

	it('loads the split module and watches its page', () => {
		const code = load(`${root}/src/routes/products/+page.breadcrumb.svelte.ts`);
		expect(code).toContain("label: 'Products'");
		expect(ctx.addWatchFile).toHaveBeenCalledWith(`${root}/src/routes/products/+page.svelte`);
		expect(ctx.warn).not.toHaveBeenCalled();
	});

	it('warns once when a page cannot be split', () => {
		writeFileSync(
			join(root, 'src/routes/products/+page.svelte'),
			page('let n = 0;\nexport const breadcrumb = async () => ({ label: `${n}` });')
		);
		const id = `${root}/src/routes/products/+page.breadcrumb.svelte.ts`;

		expect(load(id)).toBe('export { breadcrumb } from "./+page.svelte";\n');
		load(id);

		expect(ctx.warn).toHaveBeenCalledOnce();
		expect(ctx.warn.mock.calls[0][0]).toContain('src/routes/products/+page.svelte');
	});
});
