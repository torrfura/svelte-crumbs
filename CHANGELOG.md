# svelte-crumbs

## [2.0.1](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v2.0.0...svelte-crumbs-v2.0.1) (2026-08-31)


### Bug Fixes

* resolve base path through resolve() so SvelteKit 3 works ([#24](https://github.com/torrfura/svelte-crumbs/issues/24)) ([fb3acc0](https://github.com/torrfura/svelte-crumbs/commit/fb3acc0cf004a768dab204ba3eefe6b948eaf88f))

## [2.0.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.6.0...svelte-crumbs-v2.0.0) (2026-08-31)


### ⚠ BREAKING CHANGES

* buildBreadcrumbMap, BreadcrumbLookup, filePathToRoute, matchDynamicRoutePattern, getResolversForRoute and the BreadcrumbMap type are no longer exported; peer deps raised to svelte ^5.39 and @sveltejs/kit ^2.12; error pages without a matched route render no crumbs; { routes } keys targeting unrelated routes require eager: true.

### Features

* v2 — route-id matching, lazy loading, getCrumbs() ([#21](https://github.com/torrfura/svelte-crumbs/issues/21)) ([7868bec](https://github.com/torrfura/svelte-crumbs/commit/7868bec00c801670133426e485d1ba4351ff12a5))

## [1.6.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.5.0...svelte-crumbs-v1.6.0) (2026-08-31)


### Features

* **demo:** dark, mono-forward site redesign ([6784c0a](https://github.com/torrfura/svelte-crumbs/commit/6784c0a4aa2b3cfe97d6db8b3d68234894d37fdc))


### Bug Fixes

* **lint:** clear all eslint errors ([3c68a5a](https://github.com/torrfura/svelte-crumbs/commit/3c68a5a016ed908afe5bb3a37605358e2f6eb47f))

## [1.5.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.4.1...svelte-crumbs-v1.5.0) (2026-05-28)


### Features

* **demo:** figtree font, brand-mark component, redesigned landing ([2a5ba78](https://github.com/torrfura/svelte-crumbs/commit/2a5ba78d577d279f171ab0d72a6fb8e296bb4f2a))


### Performance Improvements

* **breadcrumbs:** memoize map, isolate errors, faster lookup ([eb98110](https://github.com/torrfura/svelte-crumbs/commit/eb981105ecc0e3b8870c0dce9222d761489e5429))

## [1.4.1](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.4.0...svelte-crumbs-v1.4.1) (2026-04-21)


### Bug Fixes

* **breadcrumbs:** make loaded flag reactive so crumbs refresh after async ready ([f363e0c](https://github.com/torrfura/svelte-crumbs/commit/f363e0ce6d0fdfd2a9aef05c212d8d60d63975c9))

## [1.4.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.3.0...svelte-crumbs-v1.4.0) (2026-03-12)

### Features

- **breadcrumbs:** refactor reactive logic, add e2e tests, and upgrade dependencies ([fe0b6ae](https://github.com/torrfura/svelte-crumbs/commit/fe0b6aebbf87742812cd838c0ec542afa7ec8d8d))
- **docs:** add new rendering page and enhance breadcrumb animations ([7ae6f05](https://github.com/torrfura/svelte-crumbs/commit/7ae6f05a04ca6cc7e9ef56eda2e0f081a7a24bef))

## [1.3.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.2.1...svelte-crumbs-v1.3.0) (2026-02-25)

### Features

- **breadcrumbs:** introduce optional page fields and enhance snapshot handling ([632b4bf](https://github.com/torrfura/svelte-crumbs/commit/632b4bf1cadaffc7f0d60aee6e09f2a2adf131af))

### Bug Fixes

- **breadcrumbs:** add support for spread routes and improve resolver API ([a3efd78](https://github.com/torrfura/svelte-crumbs/commit/a3efd78d19ee53b7d8efead2f720a9f853cbec7f))
- **breadcrumbs:** enhance comments and documentation, cleanup obsolete code ([32ca60f](https://github.com/torrfura/svelte-crumbs/commit/32ca60fb0c20b04480599f39bbd6087b6dc1e77f))

## [1.2.1](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.2.0...svelte-crumbs-v1.2.1) (2026-02-25)

### Bug Fixes

- **breadcrumbs:** improve type definitions and streamline resolver logic ([aa932e7](https://github.com/torrfura/svelte-crumbs/commit/aa932e7ce5b0f5d15ac2703b78cd1300c0fedb19))

## [1.2.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.1.0...svelte-crumbs-v1.2.0) (2026-02-23)

### Features

- implement global theme support and migrate Tailwind classes to CSS variables ([907a9d7](https://github.com/torrfura/svelte-crumbs/commit/907a9d78461f58b3682942160c4c05252e2308b6))
- inject app version as global constant and refactor version display ([e3e3c00](https://github.com/torrfura/svelte-crumbs/commit/e3e3c00e4e3e263385295a599c98fcdad8e7c62a))

### Bug Fixes

- update GitHub URL in `TopNav` component link ([26a8a46](https://github.com/torrfura/svelte-crumbs/commit/26a8a461e17bc250a1bd3716e4bb78c57bfaa89d))

## [1.1.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.0.3...svelte-crumbs-v1.1.0) (2026-02-23)

### Features

- add animated Breadcrumbs component ([ec04e27](https://github.com/torrfura/svelte-crumbs/commit/ec04e270bc704ba9a1d4e7a8a3e27a3dc3726ed7))
- add initial project setup for svelte-breadcrumbs (master) ([2768dfd](https://github.com/torrfura/svelte-crumbs/commit/2768dfd71bc626a2569f0ca8303ca0ef24cd4183))

### Bug Fixes

- **ci:** configure release-please manifest mode with config file ([07e2a8a](https://github.com/torrfura/svelte-crumbs/commit/07e2a8a30cfba5f9c77f411b6a254ac57f09a374))
- **ci:** separate build step from changeset publish ([bf71588](https://github.com/torrfura/svelte-crumbs/commit/bf71588e9c573d0588fc667afef28fd77462d438))

## 1.0.2

### Patch Changes

- Fixed faulty references to old project name

## 1.0.1

### Patch Changes

- Fix old package name references in source code and demo site, add LICENSE file and npm metadata
