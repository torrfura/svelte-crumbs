import type { RestCrumbMode } from '../types.js';

/** One breadcrumb level produced by walking the matched route. */
export type WalkLevel = {
	/** Group-free route-id prefix, e.g. `/products/[productId]`. */
	routeId: string;
	/** Concrete pathname prefix, e.g. `/products/42`. */
	url: string;
};

/**
 * Walks the matched route id and the concrete pathname in parallel, producing
 * one level per route segment. SvelteKit already decided what matched — the
 * walk only has to know how many pathname segments each route segment consumed:
 *
 * - `[[optional]]` consumes 0 or 1, disambiguated by `params`
 * - `[...rest]` consumes whatever is left over (minus trailing segments)
 * - everything else — static, `[param]`, `[p=matcher]`, `foo-[c]`, `[x+nn]` —
 *   consumes exactly 1
 *
 * `routeId` must already be group-free (see `stripGroups`); group segments
 * consume no pathname segment.
 */
export function walkRoute(
	routeId: string,
	pathname: string,
	params: Partial<Record<string, string>>,
	restCrumbs: RestCrumbMode = 'per-segment'
): WalkLevel[] {
	const routeSegs = routeId.split('/').filter(Boolean);
	const pathSegs = pathname.split('/').filter(Boolean);
	const urlAt = (n: number) => (n === 0 ? '/' : `/${pathSegs.slice(0, n).join('/')}`);

	const levels: WalkLevel[] = [{ routeId: '/', url: '/' }];
	let idPrefix = '';
	let p = 0;

	for (let s = 0; s < routeSegs.length; s++) {
		const seg = routeSegs[s];
		idPrefix += `/${seg}`;

		if (seg.startsWith('[[')) {
			const name = seg.slice(2, -2).split('=')[0];
			if (params[name] === undefined) {
				// Absent optional param — consumes nothing, but the page at this
				// segment may still own the crumb for the current prefix.
				levels.push({ routeId: idPrefix, url: urlAt(p) });
				continue;
			}
			levels.push({ routeId: idPrefix, url: urlAt(++p) });
			continue;
		}

		if (seg.startsWith('[...')) {
			// Count consumption from the pathname side, not params: params are
			// decoded, so an encoded %2F inside the rest value would miscount.
			const after = routeSegs.length - 1 - s;
			const consumed = Math.max(0, pathSegs.length - p - after);
			if (consumed === 0 || restCrumbs === 'single') {
				p += consumed;
				levels.push({ routeId: idPrefix, url: urlAt(p) });
			} else {
				for (let i = 0; i < consumed; i++) {
					levels.push({ routeId: idPrefix, url: urlAt(++p) });
				}
			}
			continue;
		}

		levels.push({ routeId: idPrefix, url: urlAt(++p) });
	}

	return levels;
}
