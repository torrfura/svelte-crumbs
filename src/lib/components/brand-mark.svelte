<script lang="ts">
	import logo from '../../../static/svelte-crumbs-v2.svg?raw';

	type Variant = 'hero' | 'compact';

	type Props = {
		variant?: Variant;
		showLogo?: boolean;
		showWordmark?: boolean;
		showTagline?: boolean;
		tagline?: string;
		bg?: boolean;
	};

	let {
		variant = 'hero',
		showLogo = true,
		showWordmark = true,
		showTagline = true,
		tagline = 'BREADCRUMBS FOR SVELTEKIT',
		bg = variant !== 'hero'
	}: Props = $props();
</script>

<div
	class={['flex flex-col items-center', variant === 'hero' ? 'gap-6' : 'gap-2']}
	aria-label="svelte-crumbs"
>
	{#if showLogo}
		<div
			class={[
				'[&_svg]:w-auto',
				bg && '[&_svg]:rounded-2xl',
				variant === 'hero' ? '[&_svg]:h-60' : '[&_svg]:h-12 [&_svg]:rounded-md'
			]}
			style:--logo-bg={bg ? null : 'transparent'}
			style:--logo-frame={bg ? null : 'transparent'}
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html logo}
		</div>
	{/if}

	{#if showWordmark || showTagline}
		<div class="inline-block">
			{#if showWordmark}
				<div
					class={[
						'font-bold tracking-tight text-(--color-text-primary) leading-none whitespace-nowrap',
						variant === 'hero' ? 'text-6xl' : 'text-lg'
					]}
				>
					svelte-crumbs
				</div>
			{/if}

			{#if showTagline}
				<div
					class={[
						'mt-3 flex justify-between font-semibold text-(--color-text-muted)',
						variant === 'hero' ? 'text-[0.78rem]' : 'text-[0.5rem] mt-1'
					]}
					aria-label={tagline}
				>
					{#each [...tagline] as ch, i (i)}
						{#if ch === ' '}
							<span class="w-2" aria-hidden="true"></span>
						{:else}
							<span aria-hidden="true">{ch}</span>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
