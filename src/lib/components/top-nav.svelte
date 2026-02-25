<script lang="ts">
	import { toggleTheme, getTheme } from '$lib/stores/theme.svelte.js';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import type { Breadcrumb } from '$lib/breadcrumbs/types.js';

	const appVersion: string = __APP_VERSION__;

	let { onToggleSidebar, crumbs, animated }: { onToggleSidebar: () => void; crumbs: Breadcrumb[]; animated: boolean } = $props();

	const theme = $derived(getTheme());
</script>

<header
	class="fixed top-0 right-0 left-0 z-40 flex h-20 items-center justify-between border-b border-(--color-border) bg-(--color-bg-nav) px-4"
>
	<div class="flex items-center gap-3">
		<button
			class="lg:hidden rounded-md p-1.5 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-code-bg)"
			onclick={onToggleSidebar}
			aria-label="Toggle sidebar"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="3" y1="6" x2="21" y2="6" />
				<line x1="3" y1="12" x2="21" y2="12" />
				<line x1="3" y1="18" x2="21" y2="18" />
			</svg>
		</button>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/" class="flex items-center">
			<img src="/svelte-crumbs.svg" alt="svelte-crumbs" class="h-12 " />
		</a>
		<span class="rounded-full bg-(--color-code-bg) px-2 py-0.5 text-xs text-(--color-text-muted)">v{appVersion}</span>
	</div>

	<div class="hidden lg:flex flex-1 mx-4 lg:pl-50 justify-center">
		<Breadcrumbs {crumbs} {animated} />
	</div>

	<div class="flex items-center gap-2">
		<button
			class="rounded-md p-1.5 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-code-bg)"
			onclick={toggleTheme}
			aria-label="Toggle theme"
		>
			{#if theme === 'dark'}
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="5" />
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			{/if}
		</button>
		<a
			href="https://github.com/torrfura/svelte-crumbs"
			target="_blank"
			rel="noopener noreferrer"
			class="rounded-md p-1.5 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-code-bg)"
			aria-label="GitHub"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
			</svg>
		</a>
	</div>
</header>
