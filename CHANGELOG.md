# svelte-crumbs

## [2.1.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v2.0.2...svelte-crumbs-v2.1.0) (2026-09-23)


### Features

* split breadcrumb resolvers out of page chunks ([#29](https://github.com/torrfura/svelte-crumbs/issues/29)) ([e5d5800](https://github.com/torrfura/svelte-crumbs/commit/e5d5800a178cae5906dd82bee856fe60e5b09a5c))

## [2.0.2](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v2.0.1...svelte-crumbs-v2.0.2) (2026-08-31)


### Bug Fixes

* read env flags from $app/env instead of $app/environment ([#26](https://github.com/torrfura/svelte-crumbs/issues/26)) ([8f8e5e4](https://github.com/torrfura/svelte-crumbs/commit/8f8e5e46f8cef0b2a1d010e9c18eb78a8fe2c582))

## [2.0.1](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v2.0.0...svelte-crumbs-v2.0.1) (2026-08-31)


### Bug Fixes

* resolve base path through resolve() so SvelteKit 3 works ([#24](https://github.com/torrfura/svelte-crumbs/issues/24)) ([10e2c2e](https://github.com/torrfura/svelte-crumbs/commit/10e2c2ee8ef52688887defb565f6a79e38a700b8))

## [2.0.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.6.0...svelte-crumbs-v2.0.0) (2026-08-31)


### ⚠ BREAKING CHANGES

* buildBreadcrumbMap, BreadcrumbLookup, filePathToRoute, matchDynamicRoutePattern, getResolversForRoute and the BreadcrumbMap type are no longer exported; peer deps raised to svelte ^5.39 and @sveltejs/kit ^2.12; error pages without a matched route render no crumbs; { routes } keys targeting unrelated routes require eager: true.

### Features

* v2 — route-id matching, lazy loading, getCrumbs() ([#21](https://github.com/torrfura/svelte-crumbs/issues/21)) ([dadb5b7](https://github.com/torrfura/svelte-crumbs/commit/dadb5b7b014739a5e88b8e7f3a1bfeccdc7ee269))

## [1.6.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.5.0...svelte-crumbs-v1.6.0) (2026-08-31)


### Features

* **demo:** dark, mono-forward site redesign ([9a78303](https://github.com/torrfura/svelte-crumbs/commit/9a7830377aa2a0eb408c6b59c4f8b85b58b50f10))


### Bug Fixes

* **lint:** clear all eslint errors ([6660377](https://github.com/torrfura/svelte-crumbs/commit/66603772c1eaf9ea63166cf341907e3a86eed499))

## [1.5.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.4.1...svelte-crumbs-v1.5.0) (2026-05-28)


### Features

* **demo:** figtree font, brand-mark component, redesigned landing ([8a18695](https://github.com/torrfura/svelte-crumbs/commit/8a1869527eb1b46ac089fcfad3d5af26cb428a5e))


### Performance Improvements

* **breadcrumbs:** memoize map, isolate errors, faster lookup ([6464d9d](https://github.com/torrfura/svelte-crumbs/commit/6464d9dd785c3b70822f229662a9dda0ea4239f8))

## [1.4.1](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.4.0...svelte-crumbs-v1.4.1) (2026-04-21)


### Bug Fixes

* **breadcrumbs:** make loaded flag reactive so crumbs refresh after async ready ([9e921ef](https://github.com/torrfura/svelte-crumbs/commit/9e921ef4bfa034608dc17a9626315cebabb92d98))

## [1.4.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.3.0...svelte-crumbs-v1.4.0) (2026-03-12)

### Features

- **breadcrumbs:** refactor reactive logic, add e2e tests, and upgrade dependencies ([dada378](https://github.com/torrfura/svelte-crumbs/commit/dada37858dcac6e50f877c69b005d194f99b37f0))
- **docs:** add new rendering page and enhance breadcrumb animations ([8e37a1b](https://github.com/torrfura/svelte-crumbs/commit/8e37a1b2eae6aa6848bf93257a34a2c7d5716794))

## [1.3.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.2.1...svelte-crumbs-v1.3.0) (2026-02-25)

### Features

- **breadcrumbs:** introduce optional page fields and enhance snapshot handling ([c643590](https://github.com/torrfura/svelte-crumbs/commit/c643590f58521107ba40cf3ac61122d9e5b82c4a))

### Bug Fixes

- **breadcrumbs:** add support for spread routes and improve resolver API ([cd60d15](https://github.com/torrfura/svelte-crumbs/commit/cd60d151afc32b342eb43cdd725bd41bf5972b97))
- **breadcrumbs:** enhance comments and documentation, cleanup obsolete code ([1809437](https://github.com/torrfura/svelte-crumbs/commit/18094370ca318ea82fecee5f8faa7da217eceb81))

## [1.2.1](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.2.0...svelte-crumbs-v1.2.1) (2026-02-25)

### Bug Fixes

- **breadcrumbs:** improve type definitions and streamline resolver logic ([c858cf2](https://github.com/torrfura/svelte-crumbs/commit/c858cf2cec136be45b39b9e3a0c3b15afb72fd70))

## [1.2.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.1.0...svelte-crumbs-v1.2.0) (2026-02-23)

### Features

- implement global theme support and migrate Tailwind classes to CSS variables ([c4e90c3](https://github.com/torrfura/svelte-crumbs/commit/c4e90c3eaaedc213f74e5bc7d126d9ab9793c9f4))
- inject app version as global constant and refactor version display ([7c14307](https://github.com/torrfura/svelte-crumbs/commit/7c143072118b16b250690459448a2dda142deead))

### Bug Fixes

- update GitHub URL in `TopNav` component link ([c68c12d](https://github.com/torrfura/svelte-crumbs/commit/c68c12dd92b68791fd2ce06684bd96a2144e5d08))

## [1.1.0](https://github.com/torrfura/svelte-crumbs/compare/svelte-crumbs-v1.0.3...svelte-crumbs-v1.1.0) (2026-02-23)

### Features

- add animated Breadcrumbs component ([13fea28](https://github.com/torrfura/svelte-crumbs/commit/13fea2888abb5e21a9203beeb594efca6dec2ac4))
- add initial project setup for svelte-breadcrumbs (master) ([2768dfd](https://github.com/torrfura/svelte-crumbs/commit/2768dfd71bc626a2569f0ca8303ca0ef24cd4183))

### Bug Fixes

- **ci:** configure release-please manifest mode with config file ([3dcb001](https://github.com/torrfura/svelte-crumbs/commit/3dcb001a700cb28a52cd006d8f943101f908b57d))
- **ci:** separate build step from changeset publish ([bf71588](https://github.com/torrfura/svelte-crumbs/commit/bf71588e9c573d0588fc667afef28fd77462d438))

## 1.0.2

### Patch Changes

- Fixed faulty references to old project name

## 1.0.1

### Patch Changes

- Fix old package name references in source code and demo site, add LICENSE file and npm metadata
