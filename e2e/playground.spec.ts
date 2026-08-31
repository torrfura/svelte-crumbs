import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Playground optimistic updates', () => {
	test('breadcrumb updates instantly via .withOverride() on save', async ({ page }) => {
		const warnings: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'warning' && msg.text().includes('[svelte]')) {
				warnings.push(msg.text());
			}
		});

		await page.goto('/playground');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });

		const name = `Crumb${Date.now() % 100000}`;

		// On a cold dev server the first click can land before hydration, where
		// the submit handler is not attached yet — retry the whole interaction
		// until the optimistic override is observed.
		await expect(async () => {
			await page.getByPlaceholder('Visitor').fill(name);
			await page.getByRole('button', { name: 'Save' }).click();
			// The override applies before the server round-trip completes, so
			// the trail must show the new name without navigation or reload.
			await expect(nav).toContainText(name, { timeout: 1500 });
		}).toPass({ timeout: 15000 });

		// The tracked re-run behind the optimistic update must not surface
		// hydration or waterfall warnings.
		expect(
			warnings.filter(
				(w) =>
					w.includes('hydration_mismatch') ||
					w.includes('hydration_html_changed') ||
					w.includes('await_waterfall')
			)
		).toEqual([]);
	});

	test('full flow: land on home, SPA-navigate in, save, navigate away', async ({ page }) => {
		await page.goto('/');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Svelte Crumbs');

		// SPA navigation to the playground — the crumb must appear even though
		// the page module loads lazily during this navigation.
		await page.locator('a[href="/playground"]').first().click();
		await page.waitForURL('**/playground');
		await expect(nav.locator('a, span[aria-current="page"]')).toHaveCount(2, { timeout: 5000 });

		const name = `Flow${Date.now() % 100000}`;
		await expect(async () => {
			await page.getByPlaceholder('Visitor').fill(name);
			await page.getByRole('button', { name: 'Save' }).click();
			await expect(nav).toContainText(name, { timeout: 1500 });
		}).toPass({ timeout: 15000 });

		// Navigating away must swap the trail cleanly — no stale crumbs, no crash.
		await page.locator('a[href="/products"]').first().click();
		await page.waitForURL('**/products');
		await expect(nav).toContainText('Products');
		await expect(nav).not.toContainText(name, { timeout: 5000 });
	});
});
