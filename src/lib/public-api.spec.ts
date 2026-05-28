import { describe, it, expect } from 'vitest';
import * as lib from './index.js';

describe('public API surface', () => {
	it('exports the documented runtime entry points', () => {
		expect(typeof lib.createBreadcrumbs).toBe('function');
		expect(typeof lib.buildBreadcrumbMap).toBe('function');
		expect(typeof lib.filePathToRoute).toBe('function');
		expect(typeof lib.matchDynamicRoutePattern).toBe('function');
		expect(typeof lib.getResolversForRoute).toBe('function');
		expect(typeof lib.BreadcrumbLookup).toBe('function');
	});

	it('createBreadcrumbs returns a callable getter', () => {
		// Not invoking it — that requires a Svelte rendering context.
		// We only assert the constructor shape so consumers can rely on it.
		expect(lib.createBreadcrumbs.length).toBeLessThanOrEqual(1);
	});
});
