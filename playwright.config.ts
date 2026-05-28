import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 30000,
	webServer: {
		command: 'npm run dev -- --port 5173',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 60000
	},
	use: {
		baseURL: 'http://localhost:5173',
		headless: true
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' }
		}
	]
});
