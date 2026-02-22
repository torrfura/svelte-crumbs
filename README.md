# svelte-breadcrumbs

Automatic, SSR-ready breadcrumbs for SvelteKit via route-level metadata exports. Zero config, fully reactive, server-rendered with top-level await.

**Svelte 5 + SvelteKit 2 only. Data layer only — bring your own rendering.**

## Quick Start

### 1. Install

```bash
npm install svelte-breadcrumbs
```

### 2. Export breadcrumbs from your routes

```svelte
<!-- src/routes/products/+page.svelte -->
<script lang="ts" module>
  import type { BreadcrumbMeta } from 'svelte-breadcrumbs';

  export const breadcrumb: BreadcrumbMeta = async () => ({
    label: 'Products'
  });
</script>
```

### 3. Render in your layout

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { createBreadcrumbs } from 'svelte-breadcrumbs';

  const getBreadcrumbs = createBreadcrumbs();
  const crumbs = $derived(await getBreadcrumbs());
</script>

<nav>
  {#each crumbs as crumb, i}
    {#if i > 0} / {/if}
    <a href={crumb.url}>{crumb.label}</a>
  {/each}
</nav>
```

No `{#await}` blocks needed. Breadcrumbs resolve during SSR and update reactively on client navigation.

## Examples

### Static breadcrumb

```svelte
<script lang="ts" module>
  import type { BreadcrumbMeta } from 'svelte-breadcrumbs';

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
  import type { BreadcrumbMeta } from 'svelte-breadcrumbs';

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
  import type { BreadcrumbMeta } from 'svelte-breadcrumbs';
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
  import type { BreadcrumbMeta } from 'svelte-breadcrumbs';

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
  import type { BreadcrumbMeta } from 'svelte-breadcrumbs';
  import HomeIcon from './HomeIcon.svelte';

  export const breadcrumb: BreadcrumbMeta = async () => ({
    label: 'Home',
    icon: HomeIcon
  });
</script>
```

### Custom rendering

Since `svelte-breadcrumbs` only provides data, you render however you want:

```svelte
<script lang="ts">
  import { createBreadcrumbs } from 'svelte-breadcrumbs';

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

## API Reference

### `createBreadcrumbs()`

Creates a reactive breadcrumb resolver. Returns a getter function `() => Promise<Breadcrumb[]>`.

Call `createBreadcrumbs()` once to set up the reactive state, then use the returned getter inside `$derived(await ...)` to get breadcrumbs that update on navigation and resolve during SSR.

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
```

### Utility exports

- `buildBreadcrumbMap()` — manually build the route-to-resolver map
- `filePathToRoute(filePath)` — convert glob file path to route
- `matchDynamicRoute(map, route)` — match a concrete path against dynamic patterns
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

- **SvelteKit 2** — relies on `$app/state` and `import.meta.glob`
- **Svelte 5** — uses runes (`$derived`)
- Route groups (`(group)`) are stripped from paths

### Optional: enable async and remote functions

The library works without any experimental flags — you can use load functions or resolve breadcrumbs manually. However, to unlock top-level `await` in components and remote function support, enable these flags:

```js
// svelte.config.js
const config = {
  compilerOptions: {
    experimental: {
      async: true // top-level await in components
    }
  },
  kit: {
    experimental: {
      remoteFunctions: true // call server functions from breadcrumb resolvers
    }
  }
};
```

## License

MIT
