import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Playground optimistic updates', () => {
	test('breadcrumb updates instantly via .withOverride() on save', async ({ page }) => {
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
	});
});
