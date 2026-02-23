<script lang="ts">
	import { page } from '$app/state';
	import { navigation } from '$lib/config/navigation.js';

	let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props();

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<!-- Mobile overlay -->
{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-40 bg-black/50 lg:hidden"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	></div>
{/if}

<aside
	class="fixed top-14 bottom-0 z-50 w-64 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-sidebar) p-4 transition-transform duration-200 lg:z-30 lg:translate-x-0"
	class:max-lg:-translate-x-full={!open}
	class:max-lg:translate-x-0={open}
>
	<nav>
		{#each navigation as section}
			<div class="mb-6">
				<h4 class="mb-2 text-xs font-semibold tracking-wider text-(--color-text-muted) uppercase">
					{section.title}
				</h4>
				<ul class="space-y-1">
					{#each section.items as item}
						<li>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a
								href={item.href}
								onclick={onClose}
								class="block rounded-md px-3 py-1.5 text-sm transition-colors {isActive(item.href)
									? 'bg-(--color-accent)/10 font-medium text-(--color-accent)'
									: 'text-(--color-text-secondary) hover:bg-(--color-code-bg) hover:text-(--color-text-primary)'}"
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
</aside>
