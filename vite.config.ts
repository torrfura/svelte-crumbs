import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.svelte.spec.ts']
	}
});
