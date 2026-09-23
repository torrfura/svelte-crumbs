import { existsSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { parse } from 'svelte/compiler';
import type { Plugin } from 'vite';

/** Marker comment on the first line of `breadcrumbs/routing/page-modules.ts`. */
const PAGE_MODULES_MARKER = '// svelte-crumbs:page-modules';

const PAGE_MODULES_RE = /\/breadcrumbs\/routing\/page-modules\.[jt]s$/;

/** Replacement for `page-modules.ts`: the same glob, pointed at split modules. */
const SPLIT_PAGE_MODULES = `export const pageModules = import.meta.glob('/src/routes/**/+page.svelte', { import: 'breadcrumb', query: '?breadcrumb' });
`;

/** `…/+page.svelte?breadcrumb`, as requested by the split glob. */
const QUERY_RE = /^(.*\/\+page(?:@[^/]*)?\.svelte)\?breadcrumb$/;

/**
 * The resolved id of a split module. It sits next to its page so relative
 * imports resolve as they do in the page, and ends in `.svelte.ts` so Vite
 * strips TypeScript and vite-plugin-svelte compiles it, exactly as it would
 * for a hand-written `.svelte.ts` module. The file never exists on disk.
 */
const SPLIT_RE = /\/\+page(?:@[^/]*)?\.breadcrumb\.svelte\.ts$/;

const SCRIPT_LANGS = new Set(['ts', 'typescript', 'js', 'javascript']);

const EMPTY_MODULE = 'export {};\n';

/** Converts Windows separators so ids and regexes agree on `/`. */
function toPosix(path: string): string {
	return path.replace(/\\/g, '/');
}

/** Path of the `+page.svelte` a split module id was made from. */
function pageOf(id: string): string {
	return id.replace(/\.breadcrumb\.svelte\.ts$/, '.svelte');
}

/** Result of `extractBreadcrumbModule`. */
export type ExtractResult = {
	code: string;
	/** False when the page is re-exported whole instead of split. */
	split: boolean;
	/** Why the page wasn't split. */
	reason?: string;
};

// Minimal ESTree shape — the parser's own types are loose here.
type Node = { type: string; [key: string]: unknown };

/**
 * Whether evaluating `node` at module load creates nothing that a second copy
 * of the module would need to share: functions, literals, and plain objects or
 * arrays of those. Calls and `new` are excluded — they may create state
 * (`new Map()`, `$state(…)`, a store) or run side effects.
 */
function isInert(node: Node | null | undefined): boolean {
	if (!node) return true;
	switch (node.type) {
		case 'ArrowFunctionExpression':
		case 'FunctionExpression':
		case 'ClassExpression':
		case 'Literal':
		case 'Identifier':
			return true;
		case 'TemplateLiteral':
			return (node.expressions as Node[]).every(isInert);
		case 'ObjectExpression':
			return (node.properties as Node[]).every((p) =>
				p.type === 'Property'
					? (!p.computed || isInert(p.key as Node)) && isInert(p.value as Node)
					: isInert(p.argument as Node)
			);
		case 'ArrayExpression':
			return (node.elements as (Node | null)[]).every(
				(e) => !e || isInert(e.type === 'SpreadElement' ? (e.argument as Node) : e)
			);
		case 'MemberExpression':
			return !node.computed && isInert(node.object as Node);
		case 'UnaryExpression':
			return isInert(node.argument as Node);
		case 'TSAsExpression':
		case 'TSSatisfiesExpression':
		case 'TSNonNullExpression':
		case 'TSTypeAssertion':
		case 'ParenthesizedExpression':
			return isInert(node.expression as Node);
		default:
			return false;
	}
}

/**
 * Returns why running a second copy of this top-level statement could change
 * behaviour, or `undefined` when it is safe to duplicate.
 */
function unsafeReason(statement: Node): string | undefined {
	switch (statement.type) {
		case 'ImportDeclaration':
		case 'ExportAllDeclaration':
		case 'FunctionDeclaration':
		case 'ClassDeclaration':
		case 'EmptyStatement':
		case 'TSTypeAliasDeclaration':
		case 'TSInterfaceDeclaration':
		case 'TSEnumDeclaration':
		case 'TSDeclareFunction':
		case 'TSModuleDeclaration':
			return undefined;
		case 'ExportNamedDeclaration':
			return statement.declaration ? unsafeReason(statement.declaration as Node) : undefined;
		case 'VariableDeclaration': {
			const declarations = statement.declarations as Node[];
			const names = declarations.map((d) => (d.id as Node).name ?? '…').join(', ');
			if (statement.kind !== 'const') return `declares \`${statement.kind} ${names}\``;
			const stateful = declarations.find((d) => !isInert(d.init as Node));
			return stateful ? `computes \`${(stateful.id as Node).name ?? '…'}\` at load` : undefined;
		}
		default:
			return 'runs code at load';
	}
}

/**
 * Builds the source of a page's breadcrumb module: the page's `<script module>`
 * block on its own, without the component. Line numbers are kept so errors and
 * stack traces point at the right line of the `.svelte` file.
 *
 * The split module is a second copy of the module script, so a page is only
 * split when a second copy can't change behaviour — no module-level state, no
 * side effects. Otherwise, and when the module script can't be read (another
 * language, markup that only parses after preprocessing), the module
 * re-exports from the page itself. That's the behaviour without the plugin,
 * so those pages still work; they just aren't split.
 */
export function extractBreadcrumbModule(source: string, filename: string): ExtractResult {
	if (!/\bbreadcrumb\b/.test(source)) return { code: EMPTY_MODULE, split: true };

	const reexport = (reason: string): ExtractResult => ({
		code: `export { breadcrumb } from ${JSON.stringify(`./${posix.basename(toPosix(filename))}`)};\n`,
		split: false,
		reason
	});

	let ast: ReturnType<typeof parse>;
	try {
		ast = parse(source, { modern: true, filename });
	} catch {
		return reexport('the page could not be parsed before preprocessing');
	}

	const script = ast.module;
	if (!script) return { code: EMPTY_MODULE, split: true };

	const lang = script.attributes.find((a: { name: string }) => a.name === 'lang');
	if (lang) {
		const value = Array.isArray(lang.value) ? lang.value[0] : undefined;
		if (!value || value.type !== 'Text' || !SCRIPT_LANGS.has(value.data)) {
			return reexport('its <script module> is not JavaScript or TypeScript');
		}
	}

	const program = script.content as unknown as { start: number; end: number; body: Node[] };
	for (const statement of program.body) {
		const reason = unsafeReason(statement);
		if (reason) return reexport(`its <script module> ${reason}`);
	}

	const lines = source.slice(0, program.start).split('\n').length - 1;
	return {
		code: '\n'.repeat(lines) + source.slice(program.start, program.end),
		split: true
	};
}

/**
 * Splits breadcrumb resolvers out of page components.
 *
 * Without it, `getCrumbs()` finds resolvers by importing every `+page.svelte`,
 * so loading a crumb downloads that whole page chunk and its dependencies.
 * With it, each page's `<script module>` is served as its own small module,
 * so a client downloads breadcrumb code without the pages it belongs to.
 *
 * Add it before `sveltekit()`:
 *
 * ```ts
 * import { sveltekit } from '@sveltejs/kit/vite';
 * import { crumbs } from 'svelte-crumbs/vite';
 *
 * export default defineConfig({ plugins: [crumbs(), sveltekit()] });
 * ```
 *
 * A page whose `<script module>` holds state or runs code at load is not
 * split, because the split copy would not share it with the component. The
 * plugin warns and loads that page whole, as it would without the plugin.
 */
export function crumbs(): Plugin {
	let root = toPosix(process.cwd());
	const warned = new Set<string>();

	return {
		name: 'svelte-crumbs',
		enforce: 'pre',

		configResolved(config) {
			root = toPosix(config.root);
		},

		async resolveId(source, importer) {
			const query = QUERY_RE.exec(source);
			if (query) {
				const page = await this.resolve(query[1], importer, { skipSelf: true });
				if (!page || page.external) return null;
				return toPosix(page.id).replace(/\.svelte$/, '.breadcrumb.svelte.ts');
			}

			// The dev server requests a split module by URL, which comes back
			// here root-relative (or `/@fs/`-prefixed outside the root).
			const clean = toPosix(source.split('?')[0]);
			if (!SPLIT_RE.test(clean)) return null;
			if (clean.startsWith('/@fs/')) {
				const path = clean.slice('/@fs/'.length);
				const file = /^[a-zA-Z]:\//.test(path) ? path : `/${path}`;
				return existsSync(pageOf(file)) ? file : null;
			}
			return [clean, posix.join(root, clean)].find((file) => existsSync(pageOf(file))) ?? null;
		},

		load(id) {
			const file = toPosix(id.split('?')[0]);

			if (PAGE_MODULES_RE.test(file)) {
				if (!existsSync(file)) return null;
				const original = readFileSync(file, 'utf-8');
				return original.startsWith(PAGE_MODULES_MARKER) ? SPLIT_PAGE_MODULES : null;
			}

			if (!SPLIT_RE.test(file)) return null;
			const page = pageOf(file);
			if (!existsSync(page)) return null;
			// Re-run this module whenever its page changes.
			this.addWatchFile(page);

			const result = extractBreadcrumbModule(readFileSync(page, 'utf-8'), page);
			if (!result.split && !warned.has(page)) {
				warned.add(page);
				const name = page.startsWith(`${root}/`) ? page.slice(root.length + 1) : page;
				this.warn(
					`[svelte-crumbs] not splitting ${name}: ${result.reason}. Its breadcrumb loads with the whole page; move module-level state into its own file to split it.`
				);
			}
			return result.code;
		}
	};
}
