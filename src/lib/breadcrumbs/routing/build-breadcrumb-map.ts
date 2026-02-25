import { filePathToRoute, matchDynamicRoutePattern } from './match-route.js';
import type { BreadcrumbMeta, BreadcrumbResolver, PageModuleLoader } from '../types.js';

/**
 * Lazy breadcrumb map that stores loader functions from import.meta.glob
 * and only resolves modules when a specific route is requested.
 * This avoids eagerly importing every +page.svelte at dev server startup.
 */
export class LazyBreadcrumbMap {
	#loaders: Map<string, PageModuleLoader[]>;
	#resolved = new Map<string, BreadcrumbResolver | null>();

	constructor(pageModules: Record<string, PageModuleLoader>) {
		this.#loaders = new Map();

		for (const [filePath, loader] of Object.entries(pageModules)) {
			const route = filePathToRoute(filePath);
			const existing = this.#loaders.get(route) ?? [];
			existing.push(loader);
			this.#loaders.set(route, existing);
		}
	}

	async get(route: string): Promise<BreadcrumbResolver | undefined> {
		if (this.#resolved.has(route)) {
			return this.#resolved.get(route) ?? undefined;
		}

		const loaders = this.#findLoaders(route);
		if (!loaders) return undefined;

		for (const loader of loaders) {
			const module = await loader();
			if (!module?.breadcrumb) continue;

			const meta: BreadcrumbMeta = module.breadcrumb;

			// Meta can be a single resolver or a { routes: Record<string, BreadcrumbResolver> }
			if ('routes' in meta) {
				// Cache all route resolvers from this module
				for (const [routeKey, resolver] of Object.entries(meta.routes)) {
					this.#resolved.set(routeKey, resolver);
				}

				if (this.#resolved.has(route)) {
					return this.#resolved.get(route) ?? undefined;
				}
			} else {
				const resolver = meta as BreadcrumbResolver;
				this.#resolved.set(route, resolver);
				return resolver;
			}
		}

		// Mark as resolved with no result to avoid re-loading
		this.#resolved.set(route, null);
		return undefined;
	}

	/**
	 * Find loaders for a route, supporting both exact matches
	 * and dynamic [param] segments.
	 */
	#findLoaders(route: string): PageModuleLoader[] | undefined {
		// Exact match first
		const exact = this.#loaders.get(route);
		if (exact) return exact;

		// Try dynamic pattern matching
		for (const [pattern, loaders] of this.#loaders) {
			if (matchDynamicRoutePattern(pattern, route)) {
				return loaders;
			}
		}

		return undefined;
	}
}

/**
 * Scans all +page.svelte files via import.meta.glob (lazy) for `breadcrumb` exports
 * and returns a LazyBreadcrumbMap that resolves modules on demand.
 */
export function buildBreadcrumbMap(): LazyBreadcrumbMap {
	const pageModules = import.meta.glob<{ breadcrumb?: BreadcrumbMeta }>(
		'/src/routes/**/+page.svelte'
	);

	return new LazyBreadcrumbMap(pageModules as Record<string, PageModuleLoader>);
}
