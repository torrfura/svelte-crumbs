import { describe, it, expect } from 'vitest';
import { filePathToRoute } from './match-route.js';

describe('buildBreadcrumbMap - filePathToRoute helper', () => {
	it('strips /src/routes prefix', () => {
		expect(filePathToRoute('/src/routes/dashboard/+page.svelte')).toBe('/dashboard');
	});

	it('strips +page.svelte suffix', () => {
		expect(filePathToRoute('/src/routes/settings/+page.svelte')).toBe('/settings');
	});

	it('strips single route group', () => {
		expect(filePathToRoute('/src/routes/(app)/dashboard/+page.svelte')).toBe('/dashboard');
	});

	it('strips multiple route groups', () => {
		expect(filePathToRoute('/src/routes/(app)/(admin)/users/+page.svelte')).toBe('/users');
	});

	it('handles route group at leaf level', () => {
		expect(filePathToRoute('/src/routes/settings/(tabs)/profile/+page.svelte')).toBe(
			'/settings/profile'
		);
	});

	it('returns / for root page', () => {
		expect(filePathToRoute('/src/routes/+page.svelte')).toBe('/');
	});

	it('preserves [param] segments', () => {
		expect(filePathToRoute('/src/routes/users/[userId]/posts/[postId]/+page.svelte')).toBe(
			'/users/[userId]/posts/[postId]'
		);
	});
});
