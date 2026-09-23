// svelte-crumbs:page-modules
// The `crumbs()` Vite plugin serves its own version of this module (see
// `vite.ts`), keyed on the marker comment above. Keep the exports in sync.

/** Default page discovery: every `+page.svelte`, loaded for its `breadcrumb` export. */
export const pageModules: Record<string, () => Promise<unknown>> = import.meta.glob(
	'/src/routes/**/+page.svelte',
	{ import: 'breadcrumb' }
);
