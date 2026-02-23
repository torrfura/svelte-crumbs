import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	plugins: [sveltekit(), tailwindcss()],
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.svelte.spec.ts']
	}
});
