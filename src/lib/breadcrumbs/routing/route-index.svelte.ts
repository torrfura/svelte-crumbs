import { dev } from '$app/environment';
import type { BreadcrumbMeta, BreadcrumbResolver } from '../types.js';

/** Record of page-module loaders as produced by `import.meta.glob(..., { import: 'breadcrumb' })`. */
export type ModuleRecord = Record<string, () => Promise<unknown>>;

type IndexEntry = {
	filePath: string;
	loader: () => Promise<unknown>;
	promise?: Promise<void>;
	loaded?: boolean;
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
 * paths to route ids. Page modules load on demand: `loadPending(routeIds)`
 * returns a promise for the loaders whose route id is on the current path
 * (each loads at most once), or `null` when everything needed has already
 * settled — the null case lets callers stay fully synchronous, which is what
 * keeps resolver-internal reactive reads (e.g. remote queries) tracked by the
 * consuming derived.
 *
 * `version` is reactive state bumped whenever a module finishes registering.
 * A caller that reads it before resolving is re-run by Svelte once a cold
 * load lands, and that re-run takes the synchronous path.
 */
export class RouteIndex {
	// Deliberately plain Maps, not SvelteMap: per-entry reactivity is unwanted
	// overhead — all invalidation flows through the single `version` signal.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#entries = new Map<string, IndexEntry>();

	/** Registered resolvers: route-id keys and concrete-pathname keys share one namespace. */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly resolvers = new Map<string, BreadcrumbResolver>();

	version = $state(0);

	constructor(modules: ModuleRecord, routesPrefix = '/src/routes') {
		for (const [filePath, loader] of Object.entries(modules)) {
			this.#entries.set(filePathToRouteId(filePath, routesPrefix), { filePath, loader });
		}
	}

	/** Reactive read of the index version — call in a tracked (pre-await) context. */
	track(): void {
		void this.version;
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
			try {
				const meta = (await entry.loader()) as BreadcrumbMeta | undefined;
				if (!meta) return;
				if (typeof meta === 'function') {
					this.#register(routeId, meta, entry.filePath);
				} else {
					for (const [key, resolver] of Object.entries(meta.routes)) {
						this.#register(normalizeKey(key), resolver, entry.filePath);
					}
				}
			} catch (err) {
				console.warn(`[svelte-crumbs] failed to load breadcrumb from "${entry.filePath}":`, err);
			} finally {
				entry.loaded = true;
			}
		})());
	}

	/**
	 * Bumps the reactive version. Called by consumers AFTER awaiting a cold
	 * load — in their own continuation, not inside the awaited promise — so
	 * the invalidation lands once the load has fully settled.
	 */
	bump(): void {
		this.version++;
	}

	/**
	 * Returns a promise for the not-yet-settled loaders among the given route
	 * ids (or ALL modules when called without arguments — the `eager` path),
	 * or `null` when nothing needs loading. Each module loads at most once.
	 */
	loadPending(routeIds?: string[]): Promise<void> | null {
		const pending: Promise<void>[] = [];
		if (!routeIds) {
			for (const [routeId, entry] of this.#entries) {
				if (!entry.loaded) pending.push(this.#load(entry, routeId));
			}
		} else {
			for (const id of routeIds) {
				const entry = this.#entries.get(id);
				if (entry && !entry.loaded) pending.push(this.#load(entry, id));
			}
		}
		return pending.length ? Promise.all(pending).then(() => {}) : null;
	}

	/** Promise-returning convenience over `loadPending` — mainly for tests. */
	ensureLoaded(routeIds?: string[]): Promise<void> {
		return this.loadPending(routeIds) ?? Promise.resolve();
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
