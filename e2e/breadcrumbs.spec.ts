import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Breadcrumbs rendering', () => {
	test('home page shows the root breadcrumb', async ({ page }) => {
		await page.goto('/');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Svelte Crumbs');
	});

	test('products page shows nested breadcrumbs', async ({ page }) => {
		await page.goto('/products');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Svelte Crumbs');
		await expect(nav).toContainText('Products');
	});

	test('docs page shows Documentation breadcrumb', async ({ page }) => {
		await page.goto('/docs');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Documentation');
	});

	test('internals page shows the How it works breadcrumb', async ({ page }) => {
		await page.goto('/docs/internals');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Documentation');
		await expect(nav).toContainText('How it works');
	});
});

test.describe('SSR delivery (no client flash)', () => {
	test('breadcrumbs are in the server-rendered HTML on /products', async ({ request }) => {
		const response = await request.get('/products');
		const html = await response.text();
		expect(html).toContain('aria-label="Breadcrumbs"');
		expect(html).toContain('Products');
	});

	test('breadcrumbs are in the server-rendered HTML on /docs/internals', async ({ request }) => {
		const response = await request.get('/docs/internals');
		const html = await response.text();
		expect(html).toContain('aria-label="Breadcrumbs"');
		expect(html).toContain('How it works');
	});
});

test.describe('Dynamic resolvers', () => {
	test('async resolver fills the breadcrumb for a [param] route', async ({ page }) => {
		await page.goto('/products/42');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Products');
		// The product label comes from layout.server data — non-empty string after the parent crumb.
		await expect(nav.locator('a, span[aria-current="page"]').last()).not.toHaveText('Products');
	});

	test('spread / catch-all route emits one crumb per URL segment', async ({ page }) => {
		await page.goto('/spread/users/42/settings');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		const crumbs = nav.locator('a, span[aria-current="page"]');
		await expect(async () => {
			expect(await crumbs.count()).toBeGreaterThanOrEqual(4);
		}).toPass({ timeout: 5000 });
		await expect(nav).toContainText('settings');
	});

	test('zero-segment rest route shows the Spread crumb on /spread', async ({ page }) => {
		await page.goto('/spread');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Spread');
	});
});

test.describe('Optional [[lang]] param (i18n demo)', () => {
	test('/i18n shows the default-language crumb label', async ({ page }) => {
		await page.goto('/i18n');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Greetings');
	});

	test('/i18n/sv shows the Swedish crumb label', async ({ page }) => {
		await page.goto('/i18n/sv');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });
		await expect(nav).toContainText('Hälsningar');
	});

	test('default-language crumb is in the server-rendered HTML on /i18n', async ({ request }) => {
		const response = await request.get('/i18n');
		const html = await response.text();
		expect(html).toContain('aria-label="Breadcrumbs"');
		expect(html).toContain('Greetings');
	});

	test('Swedish crumb is in the server-rendered HTML on /i18n/sv', async ({ request }) => {
		const response = await request.get('/i18n/sv');
		const html = await response.text();
		expect(html).toContain('aria-label="Breadcrumbs"');
		expect(html).toContain('Hälsningar');
	});
});

test.describe('Client-side reactivity', () => {
	test('breadcrumbs update when navigating between routes', async ({ page }) => {
		await page.goto('/');
		const nav = page.locator('nav[aria-label="Breadcrumbs"]').first();
		await expect(nav).toBeVisible({ timeout: 10000 });

		// Click a real anchor — exercises SvelteKit's client router, not a full reload.
		await page.locator('a[href="/products/42"]').first().click();
		await page.waitForURL('**/products/42');
		await expect(nav).toContainText('Products');

		await page.goBack();
		await page.waitForURL((url) => url.pathname === '/');
		await expect(nav).toContainText('Svelte Crumbs');
	});
});

test.describe('No Svelte runtime warnings', () => {
	const routes = [
		'/',
		'/products',
		'/products/42',
		'/docs',
		'/docs/internals',
		'/i18n',
		'/i18n/sv'
	];

	for (const route of routes) {
		test(`no hydration or waterfall warnings on ${route}`, async ({ page }) => {
			const warnings: string[] = [];
			page.on('console', (msg) => {
				if (msg.type() === 'warning' && msg.text().includes('[svelte]')) {
					warnings.push(msg.text());
				}
			});
			await page.goto(route);
			await page.waitForLoadState('networkidle');
			const bad = warnings.filter(
				(w) =>
					w.includes('hydration_mismatch') ||
					w.includes('hydration_html_changed') ||
					w.includes('await_waterfall')
			);
			expect(bad).toEqual([]);
		});
	}
});
