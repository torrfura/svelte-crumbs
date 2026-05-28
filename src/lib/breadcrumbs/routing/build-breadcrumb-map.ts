import { filePathToRoute } from './match-route.js';
import type { BreadcrumbMeta, BreadcrumbResolver, PageModuleLoader } from '../types.js';

type CompiledPattern = {
	segments: string[];
	spreadIndex: number;
	resolver: BreadcrumbResolver;
};

function compile(pattern: string, resolver: BreadcrumbResolver): CompiledPattern {
	const segments = pattern.split('/').filter(Boolean);
	let spreadIndex = -1;
	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		if (seg.startsWith('[...') && seg.endsWith(']')) {
			spreadIndex = i;
			break;
		}
	}
	return { segments, spreadIndex, resolver };
}

function matchCompiled(p: CompiledPattern, routeSegments: string[]): boolean {
	const { segments, spreadIndex } = p;
	if (spreadIndex !== -1) {
		if (routeSegments.length <= spreadIndex) return false;
		for (let i = 0; i < spreadIndex; i++) {
			const seg = segments[i];
			if (seg.charCodeAt(0) === 91 /* '[' */) continue;
			if (seg !== routeSegments[i]) return false;
		}
		return true;
	}
	if (routeSegments.length !== segments.length) return false;
	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		if (seg.charCodeAt(0) === 91 /* '[' */) continue;
		if (seg !== routeSegments[i]) return false;
	}
	return true;
}

/**
 * Synchronous breadcrumb resolver lookup.
 * Supports exact, dynamic `[param]`, and `[...spread]` route matching.
 *
 * Internally splits patterns into a static `Map` (O(1) exact match) and a
 * pre-compiled list of dynamic patterns (segments already split). Lookups
 * are memoized per route, so repeated navigation to the same path costs
 * one map hit regardless of how many dynamic patterns are registered.
 */
export class BreadcrumbLookup {
	#static = new Map<string, BreadcrumbResolver>();
	#dynamic: CompiledPattern[] = [];
	#cache = new Map<string, BreadcrumbResolver | null>();

	constructor(resolvers?: Map<string, BreadcrumbResolver>) {
		if (resolvers) {
			for (const [pattern, resolver] of resolvers) {
				this.set(pattern, resolver);
			}
		}
	}

	/** @internal — used during build. Keeps indices in sync. */
	set(pattern: string, resolver: BreadcrumbResolver): void {
		if (pattern.includes('[')) {
			this.#dynamic.push(compile(pattern, resolver));
		} else {
			this.#static.set(pattern, resolver);
		}
		if (this.#cache.size) this.#cache.clear();
	}

	/** Looks up a resolver by exact match, then dynamic/spread pattern match. */
	get(route: string): BreadcrumbResolver | undefined {
		const cached = this.#cache.get(route);
		if (cached !== undefined) return cached ?? undefined;

		const exact = this.#static.get(route);
		if (exact) {
			this.#cache.set(route, exact);
			return exact;
		}

		if (this.#dynamic.length) {
			const routeSegments = route.split('/').filter(Boolean);
			for (const p of this.#dynamic) {
				if (matchCompiled(p, routeSegments)) {
					this.#cache.set(route, p.resolver);
					return p.resolver;
				}
			}
		}

		this.#cache.set(route, null);
		return undefined;
	}
}

let cached: { ready: Promise<void>; lookup: BreadcrumbLookup } | undefined;

/**
 * Scans all `+page.svelte` files for `breadcrumb` exports using non-eager
 * `import.meta.glob`. Modules are loaded in parallel on first access;
 * after that, all lookups are synchronous. The result is memoized so
 * multiple `createBreadcrumbs()` calls share one load.
 *
 * @returns `lookup` for sync route resolution, `ready` to await initial load.
 */
export function buildBreadcrumbMap(): { ready: Promise<void>; lookup: BreadcrumbLookup } {
	if (cached) return cached;

	const pageModules = import.meta.glob<BreadcrumbMeta>('/src/routes/**/+page.svelte', {
		import: 'breadcrumb'
	});

	const lookup = new BreadcrumbLookup();

	const ready = Promise.all(
		Object.entries(pageModules).map(async ([filePath, loader]) => {
			let meta: BreadcrumbMeta | undefined;
			try {
				meta = await (loader as PageModuleLoader)();
			} catch (err) {
				console.warn(`[svelte-crumbs] failed to load breadcrumb from "${filePath}":`, err);
				return;
			}
			if (!meta) return;

			const route = filePathToRoute(filePath);
			if (typeof meta === 'function') {
				lookup.set(route, meta);
			} else {
				for (const [routeKey, resolver] of Object.entries(meta.routes)) {
					lookup.set(routeKey, resolver);
				}
			}
		})
	).then(() => {});

	cached = { ready, lookup };
	return cached;
}
