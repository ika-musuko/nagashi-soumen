<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SubtitleItem from './SubtitleItem.svelte';
	import type { Subtitle } from '../subtitles/Subtitle';
	import { scrollContainerToItem } from '../utils/utils';

	export let subs: Subtitle[];
	export let activeSubIds: Set<string>;
	$: activeSubIds, makeActiveCuesVisible();
	function makeActiveCuesVisible() {
		const activeSubs: HTMLCollection =
			document.getElementsByClassName('active-subtitle');
		if (activeSubs.length < 1) return;

		const activeSubForView: HTMLElement = activeSubs[
			activeSubs.length - 1
		] as HTMLElement;

		scrollContainerToItem(subtitleListElement, activeSubForView);
	}

	const dispatch = createEventDispatcher();
	function handleSeek(t: number) {
		dispatch('seek', { time: t });
	}

	let subtitleListElement: HTMLElement;
</script>

{#if subs}
	<div id="subtitle-list" bind:this={subtitleListElement}>
		{#each subs as sub}
			<SubtitleItem
				bind:startTime={sub.startTime}
				bind:text={sub.text}
				active={activeSubIds.has(sub.id)}
				on:click={() => handleSeek(sub.startTime)}
			/>
		{/each}
	</div>
{/if}

<style>
	#subtitle-list {
		max-height: 100%;
		overflow: auto;
		list-style: none;
	}
</style>
