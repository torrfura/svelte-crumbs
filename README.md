# svelte-crumbs

Automatic, SSR-ready breadcrumbs for SvelteKit via route-level metadata exports. Zero config, fully reactive, server-rendered with top-level await.

**Svelte 5 + SvelteKit 2 only. Data layer only — bring your own rendering.**

**[Documentation & Live Demo](https://svelte-crumbs.vercel.app/)**

## Quick Start

### 1. Install

```bash
npm install svelte-crumbs
```

### 2. Enable experimental async

This library relies on Svelte's experimental `async` compiler option for top-level `await` in components. This is **required**.

```js
// svelte.config.js
const config = {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

> To also use [remote functions](https://svelte.dev/docs/kit/remote-functions) in your breadcrumb resolvers, add `kit.experimental.remoteFunctions: true` as well.

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
	import { createBreadcrumbs } from 'svelte-crumbs';

	const getBreadcrumbs = createBreadcrumbs();
	const crumbs = $derived(await getBreadcrumbs());
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

No `{#await}` blocks needed. Breadcrumbs resolve during SSR and update reactively on client navigation.

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

The breadcrumb resolver receives the full `page` object, including `page.data`. Use `+layout.server.ts` (not `+page.server.ts`) so the data is available to child routes' breadcrumbs too:

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

Breadcrumb resolvers can call [remote functions](https://svelte.dev/docs/kit/remote-functions) that run on the server:

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
	import { createBreadcrumbs } from 'svelte-crumbs';

	const getBreadcrumbs = createBreadcrumbs();
	const crumbs = $derived(await getBreadcrumbs());
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

### Localized paths (Paraglide & friends)

With i18n routing, `page.url.pathname` carries a locale prefix (`/nl/products/42`) while your route tree does not. Pass `transformPath` to strip it before matching:

```svelte
<script lang="ts">
	import { createBreadcrumbs } from 'svelte-crumbs';
	import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';

	const getBreadcrumbs = createBreadcrumbs({
		transformPath: ({ pathname }) => deLocalizeHref(pathname)
	});
	const crumbs = $derived(await getBreadcrumbs());
</script>

{#each crumbs as crumb}
	<a href={localizeHref(crumb.url)}>{crumb.label}</a>
{/each}
```

The transform runs before route matching, so resolvers also see the de-localized path — `page.url.pathname` and `page.url.href` inside a resolver are `/products/42` and `http://…/products/42`, with `search` and `hash` preserved. Resolved `crumb.url` values are de-localized too, which is why the example re-localizes them at render time.

The second field, `url`, is the untransformed page URL — useful when the locale lives somewhere other than the path:

```ts
const getBreadcrumbs = createBreadcrumbs({
	transformPath: ({ pathname, url }) => (url.searchParams.has('embed') ? '/' : pathname)
});
```

Return values are normalized to a leading-slash path (`''` becomes `/`). If the transform throws, the error is logged and the raw pathname is used, so a broken transform degrades the trail instead of breaking the page.

## API Reference

### `createBreadcrumbs(options?)`

Creates a reactive breadcrumb resolver. Returns a getter function `() => Promise<Breadcrumb[]>`.

Call `createBreadcrumbs()` once to set up the reactive state, then use the returned getter inside `$derived(await ...)` to get breadcrumbs that update on navigation and resolve during SSR.

| Option          | Type                                 | Description                                                                                                                                                                       |
| --------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include`       | `OptionalPageField[]`                | Extra `page` fields to expose to resolvers: `'status'`, `'error'`, `'form'`, `'state'`. Off by default so breadcrumbs don't take reactive dependencies on rarely-used properties. |
| `transformPath` | `(ctx: { pathname, url }) => string` | Rewrites the current pathname before route matching. See below.                                                                                                                   |

### Types

```typescript
// What you export from +page.svelte
type BreadcrumbMeta = BreadcrumbResolver | { routes: Record<string, BreadcrumbResolver> };

// Resolver function
type BreadcrumbResolver = (page: Page) => Promise<BreadcrumbData | undefined>;

// Data for one breadcrumb
type BreadcrumbData = { label: string; icon?: Component<any> };

// Resolved breadcrumb with URL
type Breadcrumb = BreadcrumbData & { url: string };

// createBreadcrumbs options
type CreateBreadcrumbsOptions = {
	include?: OptionalPageField[];
	transformPath?: PathTransform;
};

type PathTransform = (context: { pathname: string; url: URL }) => string;
```

### Utility exports

- `buildBreadcrumbMap()` — manually build the route-to-resolver map
- `filePathToRoute(filePath)` — convert glob file path to route
- `matchDynamicRoutePattern(pattern, route)` — match a concrete path against a dynamic route pattern
- `getResolversForRoute(map, route)` — collect resolvers for a given route path

## How It Works

1. `import.meta.glob` eagerly imports all `+page.svelte` files at build time
2. Each file's `breadcrumb` export is collected into a `Map<route, resolver>`
3. Route groups like `(app)` are stripped from paths
4. On navigation, the root (`/`) resolver is checked first, then each segment is walked from left to right with dynamic `[param]` matching
5. Matching resolvers run in parallel, producing the final breadcrumb array
6. On SSR, top-level `await` ensures breadcrumbs are rendered in the initial HTML
7. On the client, `$derived` re-evaluates when the route changes

## Requirements

- **Svelte 5** with `compilerOptions.experimental.async: true` — uses `$derived(await ...)` for reactive, SSR-safe breadcrumbs
- **SvelteKit 2** — relies on `$app/state` and `import.meta.glob`
- Route groups (`(group)`) are stripped from paths

## License

MIT
