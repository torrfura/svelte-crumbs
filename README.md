# svelte-crumbs

Automatic, SSR-ready breadcrumbs for SvelteKit via route-level metadata exports. Zero config, fully reactive, matched against SvelteKit's own routing.

**Svelte 5 + SvelteKit 2 only. Data layer only — bring your own rendering.**

**[Documentation & Live Demo](https://svelte-crumbs.vercel.app/)**

## Quick Start

### 1. Install

```bash
npm install svelte-crumbs
```

### 2. Enable experimental async (for server-rendered crumbs)

Svelte's experimental `async` compiler option enables `await` inside `$derived` and in templates. It is required **only** for the server-rendered pattern shown below (`$derived(await ...)`). If you don't want to enable the flag, see [Rendering without the flag](#rendering-without-the-flag).

```js
// svelte.config.js
const config = {
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

> **Using remote functions in resolvers?** If your breadcrumb resolvers call [remote functions](https://svelte.dev/docs/kit/remote-functions), also add `kit.experimental.remoteFunctions: true`. This is optional and unrelated to breadcrumbs themselves.

### 3. Export breadcrumbs from your routes

```svelte
<!-- src/routes/products/+page.svelte -->
<script lang="ts" module>
	import type { BreadcrumbMeta } from 'svelte-crumbs';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Products'
	});
</script>
```

### 4. Render in your layout

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { getCrumbs } from 'svelte-crumbs';

	const crumbs = $derived(await getCrumbs());
</script>

<nav>
	{#each crumbs as crumb, i}
		{#if i > 0}
			/
		{/if}
		<a href={crumb.url}>{crumb.label}</a>
	{/each}
</nav>
```

No `{#await}` blocks needed. Breadcrumbs resolve during SSR and update reactively on client navigation. You can also inline it: `{#each await getCrumbs() as crumb}`.

> **Don't wrap the trail in a `<svelte:boundary>` with a `pending` snippet** if you want server-rendered crumbs — the server renders the pending snippet instead of awaiting, so the crumbs drop out of the initial HTML. Top-level `await getCrumbs()` in a layout needs no boundary.

### Rendering without the flag

If you'd rather not enable `compilerOptions.experimental.async`, use a plain `{#await}` block:

```svelte
<script lang="ts">
	import { getCrumbs } from 'svelte-crumbs';
</script>

{#await getCrumbs() then crumbs}
	<nav>
		{#each crumbs as crumb}
			<a href={crumb.url}>{crumb.label}</a>
		{/each}
	</nav>
{/await}
```

Trade-offs: crumbs are client-rendered (SSR emits the pending branch, so they're not in the initial HTML), and the trail briefly clears on navigation while the new promise resolves.

## Migrating from v1

### The one-minute path

Replace the factory with a direct call — that's it for most apps:

```diff
-import { createBreadcrumbs } from 'svelte-crumbs';
+import { getCrumbs } from 'svelte-crumbs';

-const getBreadcrumbs = createBreadcrumbs();
-const crumbs = $derived(await getBreadcrumbs());
+const crumbs = $derived(await getCrumbs());
```

Everything you export from routes is unchanged: `breadcrumb` module exports, the `{ routes: {...} }` form, resolver signatures, and returning `undefined` to skip a crumb all work exactly as before. `createBreadcrumbs(options)` still exists as a deprecated shim (it returns `() => getCrumbs(options)`), so v1 code keeps working with a deprecation notice.

### Removed exports

These low-level utilities are gone. They were internals of the old pattern matcher, and there was no way to wire their outputs back into `createBreadcrumbs` anyway — so nothing real could have been built on them. Runtime exports are now exactly `getCrumbs` and `createBreadcrumbs`.

| Removed                    | Was                                  |
| -------------------------- | ------------------------------------ |
| `buildBreadcrumbMap`       | manual route-to-resolver map builder |
| `BreadcrumbLookup`         | lookup helper for the map            |
| `filePathToRoute`          | glob path → route conversion         |
| `matchDynamicRoutePattern` | custom dynamic-segment matcher       |
| `getResolversForRoute`     | resolver collection for a route      |
| `BreadcrumbMap` (type)     | type of the manual map               |

### Behavior changes

Matching is now keyed by SvelteKit's own `page.route.id` instead of a custom pattern matcher, which fixes a class of v1 bugs and changes a few edge behaviors:

- **Now work out of the box (v1 bugs):** optional params `[[lang]]` (with and without the param present), param matchers `[id=integer]`, compound segments `foo-[c]`, rest params matching zero segments, segments after a rest param, and apps with `paths.base` configured (crumb URLs now include the base).
- **Resolver precedence** now matches SvelteKit's route resolution exactly — whatever route SvelteKit picked is the one whose crumbs render.
- **Error pages** (no matched route) render no crumbs.
- **Lazy loading:** page modules load per-route instead of all up front. If a `{ routes }` export registers crumbs for routes _unrelated_ to the declaring page, pass `eager: true` so that module is guaranteed to load.

### Peer requirements

v2 declares **Svelte >= 5.39** (experimental async SSR) and **@sveltejs/kit >= 2.12** (`$app/state`). These were de-facto required by v1 already — v2 just says so.

## Examples

### Static breadcrumb

```svelte
<script lang="ts" module>
	import type { BreadcrumbMeta } from 'svelte-crumbs';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Settings'
	});
</script>
```

### From load data

The breadcrumb resolver receives a snapshot of the `page` object, including `page.data`. Use `+layout.server.ts` (not `+page.server.ts`) so the data is available to child routes' breadcrumbs too:

```ts
// src/routes/products/[id]/+layout.server.ts
export async function load({ params }) {
	const product = await db.products.find(params.id);
	return { product };
}
```

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script lang="ts" module>
	import type { BreadcrumbMeta } from 'svelte-crumbs';

	export const breadcrumb: BreadcrumbMeta = async (page) => ({
		label: page.data.product.name
	});
</script>

<script lang="ts">
	let { data } = $props();
</script>

<h1>{data.product.name}</h1>
```

> **Why `+layout.server.ts`?** Breadcrumb resolvers run for every segment of the URL. When visiting `/products/42/edit`, the resolver for `/products/[id]` fires too. If you put the load in `+page.server.ts`, `page.data` on child routes won't have `product` — layout data cascades down, page data doesn't.

### From a remote function

Breadcrumb resolvers can call [remote functions](https://svelte.dev/docs/kit/remote-functions) that run on the server (requires `kit.experimental.remoteFunctions: true`):

```ts
// src/lib/products.remote.ts
import { query } from '$app/server';

export const getProductName = query('unchecked', async (id: string) => {
	const product = await db.products.find(id);
	return product.name;
});
```

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script lang="ts" module>
	import type { BreadcrumbMeta } from 'svelte-crumbs';
	import { getProductName } from '$lib/products.remote';

	export const breadcrumb: BreadcrumbMeta = async (page) => ({
		label: await getProductName(page.params.id ?? '')
	});
</script>
```

### Multi-route breadcrumb

For dynamic routes that map to known paths:

```svelte
<script lang="ts" module>
	import type { BreadcrumbMeta } from 'svelte-crumbs';

	export const breadcrumb: BreadcrumbMeta = {
		routes: {
			'/docs/getting-started': async () => ({ label: 'Getting Started' }),
			'/docs/api-reference': async () => ({ label: 'API Reference' })
		}
	};
</script>
```

Keys are matched against the concrete pathname (and win over the declaring route's own resolver at the same level). Since modules load lazily, keys that target routes **unrelated** to the declaring page only take effect with `getCrumbs({ eager: true })`.

### With icon

```svelte
<script lang="ts" module>
	import type { BreadcrumbMeta } from 'svelte-crumbs';
	import HomeIcon from './HomeIcon.svelte';

	export const breadcrumb: BreadcrumbMeta = async () => ({
		label: 'Home',
		icon: HomeIcon
	});
</script>
```

### Custom rendering

Since `svelte-crumbs` only provides data, you render however you want:

```svelte
<script lang="ts">
	import { getCrumbs } from 'svelte-crumbs';

	const crumbs = $derived(await getCrumbs());
</script>

<ol class="breadcrumb-list">
	{#each crumbs as crumb}
		<li>
			{#if crumb.icon}
				{@const Icon = crumb.icon}
				<Icon />
			{/if}
			<a href={crumb.url}>{crumb.label}</a>
		</li>
	{/each}
</ol>
```

## Localized paths (Paraglide & friends)

If your i18n library rewrites URLs with a locale prefix (`/de/produkte/42`) while your route tree stays unprefixed (`src/routes/products/[id]`), use `transformPath` to strip the prefix before matching, and re-localize crumb URLs at render time:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { getCrumbs } from 'svelte-crumbs';
	import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';

	const crumbs = $derived(
		await getCrumbs({
			transformPath: ({ pathname }) => deLocalizeHref(pathname)
		})
	);
</script>

<nav>
	{#each crumbs as crumb}
		<a href={localizeHref(crumb.url)}>{crumb.label}</a>
	{/each}
</nav>
```

Details:

- `transformPath` receives `{ pathname, url }`. `pathname` already has `paths.base` stripped; `url` is the full, untransformed page URL — useful when the locale lives outside the path (a domain, subdomain, or query param).
- The return value is normalized: an empty string becomes `/`, and a missing leading slash is added.
- If your transform throws, the error is logged and the raw pathname is used — a broken transform degrades the trail instead of breaking the page.
- Resolvers see the transformed path: the `page` snapshot's `url` is rebuilt around it, so `page.url.pathname` matches what was routed.

**Alternative:** if your locale is a route param instead — `src/routes/[[lang]]/products/[id]` — no transform is needed. Optional `[[lang]]` params match out of the box in v2, with and without the locale present.

## API Reference

### `getCrumbs(options?)`

Resolves the breadcrumb trail for the current route. Returns `Promise<Breadcrumb[]>`.

It reads SvelteKit's reactive `page` state synchronously before awaiting, so calling it inside `$derived(await getCrumbs())`, `{#each await getCrumbs() as crumb}`, or `{#await getCrumbs()}` tracks navigation and updates automatically. No setup call needed — it's a plain function backed by a shared, memoized route index.

#### Options

| Option          | Type                                           | Default         | Description                                                                                                                                                                                                                |
| --------------- | ---------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include`       | `('status' \| 'error' \| 'form' \| 'state')[]` | `[]`            | Extra `page` fields exposed to resolvers. Off by default so crumbs don't take reactive dependencies on rarely-used properties.                                                                                             |
| `transformPath` | `({ pathname, url }) => string`                | —               | Rewrites the pathname before route matching. See [Localized paths](#localized-paths-paraglide--friends).                                                                                                                   |
| `eager`         | `boolean`                                      | `false`         | Load every page module up front instead of only the modules along the current path. Needed only when a `{ routes }` export targets routes unrelated to the declaring page.                                                 |
| `restCrumbs`    | `'per-segment' \| 'single'`                    | `'per-segment'` | One crumb per `[...rest]` segment, or a single crumb for the whole rest value.                                                                                                                                             |
| `modules`       | `Record<string, () => Promise<unknown>>`       | auto            | Override page discovery with your own `import.meta.glob(..., { import: 'breadcrumb' })` record — for non-default route directories or tests. Hoist the glob to module scope so the record identity is stable across calls. |
| `routesPrefix`  | `string`                                       | `'/src/routes'` | File-path prefix stripped when deriving route ids from `modules` keys.                                                                                                                                                     |

### `createBreadcrumbs(options?)` (deprecated)

v1 factory, kept as a shim: returns `() => getCrumbs(options)`. It holds no state — call `getCrumbs` directly instead.

### Types

```typescript
// What you export from +page.svelte
type BreadcrumbMeta = BreadcrumbResolver | { routes: Record<string, BreadcrumbResolver> };

// Resolver function — receives the page snapshot and the crumb's own URL path
type BreadcrumbResolver = (
	page: BreadcrumbPage,
	url: string
) => Promise<BreadcrumbData | undefined>;

// Page snapshot passed to resolvers
type BreadcrumbPage = Pick<Page, 'url' | 'params' | 'route' | 'data'> &
	Partial<Pick<Page, 'status' | 'error' | 'form' | 'state'>>;

// Data for one breadcrumb — return undefined to skip the crumb
type BreadcrumbData = { label: string; icon?: Component };

// Resolved breadcrumb with URL (includes paths.base when configured)
type Breadcrumb = BreadcrumbData & { url: string };
```

`BreadcrumbPage` is a plain **snapshot** of `page` — `url`, `params`, `route`, and `data` are always present; `status`, `error`, `form`, and `state` are only there when opted in via `include`. The second `url` argument is the crumb's own pathname (before `paths.base` is prepended), handy when one resolver serves multiple `{ routes }` keys.

## How It Works

1. `import.meta.glob('/src/routes/**/+page.svelte')` provides the route file **keys** — building the index is synchronous, no modules load yet
2. Each file path is converted to a route id, with `(group)` segments stripped
3. On navigation, SvelteKit's own `page.route.id` and the concrete pathname are walked in parallel, producing one level per route segment — matching is exact Map lookups against route-id prefixes, no pattern matching
4. Only the page modules along the current path (~one per depth level) block resolution, each loading at most once; their `breadcrumb` exports register resolvers (`eager: true` loads everything up front instead)
5. After hydration, an idle-time warmup loads the remaining breadcrumb modules in the background and re-runs the trail once — from then on resolution is fully synchronous, so reactive reads inside resolvers (remote queries, optimistic overrides) stay tracked
6. Concrete-pathname keys from `{ routes }` win over route-id keys at the same level
7. Matched resolvers run in parallel; `undefined` results and throwing resolvers are skipped, producing the final breadcrumb array
8. On SSR, top-level `await` ensures breadcrumbs are in the initial HTML; on the client, `$derived` re-evaluates when the route changes

Because SvelteKit already decided which route matched, optional params, matchers, compound segments, rest params, and `paths.base` all behave exactly as they do in your app's routing.

## Requirements

- **Svelte >= 5.39** — `compilerOptions.experimental.async: true` is needed for the server-rendered `$derived(await ...)` pattern; the `{#await}` pattern works without the flag
- **SvelteKit >= 2.12** — relies on `$app/state` and `import.meta.glob`
- Route groups (`(group)`) are stripped from paths

## License

MIT
