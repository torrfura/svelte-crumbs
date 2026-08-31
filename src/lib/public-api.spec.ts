import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({ dev: false, browser: false }));
vi.mock('$app/state', () => ({ page: {} }));
vi.mock('$app/paths', () => ({ base: '' }));

describe('public API', () => {
	it('exposes exactly the documented runtime exports', async () => {
		const api = await import('./index.js');

		expect(typeof api.getCrumbs).toBe('function');
		expect(typeof api.createBreadcrumbs).toBe('function');
		expect(Object.keys(api).sort()).toEqual(['createBreadcrumbs', 'getCrumbs']);
	});
});
