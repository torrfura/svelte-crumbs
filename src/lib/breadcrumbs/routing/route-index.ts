import { dev } from '$app/environment';
import type { BreadcrumbMeta, BreadcrumbResolver } from '../types.js';

/** Record of page-module loaders as produced by `import.meta.glob(..., { import: 'breadcrumb' })`. */
export type ModuleRecord = Record<string, () => Promise<unknown>>;

type IndexEntry = {
	filePath: string;
	loader: () => Promise<unknown>;
	promise?: Promise<void>;
};

const GROUP_RE = /\/\(.*?\)/g;

/** Strips `(group)` segments from a route id. Groups consume no pathname segment. */
export function stripGroups(routeId: string): string {
	return routeId.replace(GROUP_RE, '') || '/';
}

/**
 * Converts a file path from `import.meta.glob` to a group-free route id.
 *
 * @example
 * filePathToRouteId('/src/routes/(group)/products/[id]/+page.svelte') // → '/products/[id]'
 * filePathToRouteId('/src/routes/products/+page@admin.svelte')        // → '/products'
 */
export function filePathToRouteId(filePath: string, routesPrefix = '/src/routes'): string {
	return stripGroups(
		filePath.replace(/\/\+page(@[^/]*)?\.svelte$/, '').slice(routesPrefix.length) || '/'
	);
}

/** Normalizes a user-authored `{ routes }` key: leading slash, no trailing slash, groups stripped. */
function normalizeKey(key: string): string {
	let k = key.startsWith('/') ? key : `/${key}`;
	if (k.length > 1 && k.endsWith('/')) k = k.slice(0, -1);
	return stripGroups(k);
}

/**
 * Lazy breadcrumb registry keyed by route id.
 *
 * Construction is synchronous — only the glob KEYS are needed to map file
 * paths to route ids. Page modules load on demand: `ensureLoaded(routeIds)`
 * awaits only the loaders whose route id is on the current path, each at most
 * once. Loaded modules register their resolvers into `resolvers`, keyed by
 * route id (function form) or normalized `{ routes }` key.
 */
export class RouteIndex {
	#entries = new Map<string, IndexEntry>();
	#all?: Promise<void>;

	/** Registered resolvers: route-id keys and concrete-pathname keys share one namespace. */
	readonly resolvers = new Map<string, BreadcrumbResolver>();

	constructor(modules: ModuleRecord, routesPrefix = '/src/routes') {
		for (const [filePath, loader] of Object.entries(modules)) {
			this.#entries.set(filePathToRouteId(filePath, routesPrefix), { filePath, loader });
		}
	}

	#register(key: string, resolver: BreadcrumbResolver, filePath: string): void {
		if (dev && this.resolvers.has(key) && this.resolvers.get(key) !== resolver) {
			console.warn(
				`[svelte-crumbs] duplicate breadcrumb registration for "${key}" (from "${filePath}") — the later registration wins`
			);
		}
		this.resolvers.set(key, resolver);
	}

	#load(entry: IndexEntry, routeId: string): Promise<void> {
		return (entry.promise ??= (async () => {
			let meta: BreadcrumbMeta | undefined;
			try {
				meta = (await entry.loader()) as BreadcrumbMeta | undefined;
			} catch (err) {
				console.warn(`[svelte-crumbs] failed to load breadcrumb from "${entry.filePath}":`, err);
				return;
			}
			if (!meta) return;
			if (typeof meta === 'function') {
				this.#register(routeId, meta, entry.filePath);
			} else {
				for (const [key, resolver] of Object.entries(meta.routes)) {
					this.#register(normalizeKey(key), resolver, entry.filePath);
				}
			}
		})());
	}

	/**
	 * Loads the page modules for the given route ids (or every module when
	 * called without arguments — the `eager` path). Each module loads at most
	 * once; repeat calls resolve from the memoized promise.
	 */
	ensureLoaded(routeIds?: string[]): Promise<void> {
		if (!routeIds) {
			return (this.#all ??= Promise.all(
				Array.from(this.#entries, ([routeId, entry]) => this.#load(entry, routeId))
			).then(() => {}));
		}
		const pending: Promise<void>[] = [];
		for (const id of routeIds) {
			const entry = this.#entries.get(id);
			if (entry) pending.push(this.#load(entry, id));
		}
		return Promise.all(pending).then(() => {});
	}
}

let defaultIndex: RouteIndex | undefined;
const injectedIndexes = new WeakMap<ModuleRecord, RouteIndex>();

/**
 * Returns the shared route index. Without arguments, scans the consuming
 * app's `/src/routes/**` via `import.meta.glob` (memoized for the module
 * lifetime — safe cross-request on the server, the contents are build-static).
 * With an injected `modules` record, memoizes per record identity.
 */
export function getRouteIndex(modules?: ModuleRecord, routesPrefix?: string): RouteIndex {
	if (modules) {
		let index = injectedIndexes.get(modules);
		if (!index) {
			index = new RouteIndex(modules, routesPrefix);
			injectedIndexes.set(modules, index);
		}
		return index;
	}
	return (defaultIndex ??= new RouteIndex(
		import.meta.glob('/src/routes/**/+page.svelte', { import: 'breadcrumb' })
	));
}
