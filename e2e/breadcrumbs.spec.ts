import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Breadcrumbs rendering', () => {
	test('home page shows Home breadcrumb', async ({ page }) => {
		await page.goto('http://localhost:5173/');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]');
		await expect(nav.first()).toBeVisible({ timeout: 10000 });
		await expect(nav.first()).toContainText('Home');
	});

	test('products page shows Products breadcrumb', async ({ page }) => {
		await page.goto('http://localhost:5173/products');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]');
		await expect(nav.first()).toBeVisible({ timeout: 10000 });
		await expect(nav.first()).toContainText('Home');
		await expect(nav.first()).toContainText('Products');
	});

	test('docs page shows Documentation breadcrumb', async ({ page }) => {
		await page.goto('http://localhost:5173/docs');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]');
		await expect(nav.first()).toBeVisible({ timeout: 10000 });
		await expect(nav.first()).toContainText('Home');
		await expect(nav.first()).toContainText('Documentation');
	});

	test('no hydration or waterfall warnings in console', async ({ page }) => {
		const warnings: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'warning' && msg.text().includes('[svelte]')) {
				warnings.push(msg.text());
			}
		});
		await page.goto('http://localhost:5173/docs');
		await page.waitForTimeout(3000);
		const bad = warnings.filter(
			(w) =>
				w.includes('hydration_mismatch') ||
				w.includes('hydration_html_changed') ||
				w.includes('await_waterfall')
		);
		expect(bad).toEqual([]);
	});
});
