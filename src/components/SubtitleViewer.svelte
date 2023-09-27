<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SubtitleItem from './SubtitleItem.svelte';
	import type { Subtitle } from '../models/Subtitle';
	import { count, scrollContainerToItem } from '../utils/utils';

	export let subs: Subtitle[];
	$: subs, makeActiveCuesVisible();
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

	function handleUnsave(sub: Subtitle) {
		dispatch('unsave', { sub: sub });
	}

	let subtitleListElement: HTMLElement;
</script>

<div id="container">
	<div id="all-subtitles-list" bind:this={subtitleListElement}>
		{#each subs as sub}
			<SubtitleItem
				bind:startTime={sub.startTime}
				bind:text={sub.text}
				active={sub.active}
				on:click={() => handleSeek(sub.startTime)}
			/>
		{/each}
	</div>
	<hr />
	<div>{count(subs, (sub) => sub.saved)}</div>
	<div id="saved-subtitles-list">
		{#each subs as sub}
			{#if sub.saved}
				<span class="subtitle-row">
					<button class="delete-button" on:click={() => handleUnsave(sub)}
						>╳</button
					>
					<SubtitleItem
						bind:startTime={sub.startTime}
						bind:text={sub.text}
						on:click={() => handleSeek(sub.startTime)}
					/>
				</span>
			{/if}
		{/each}
	</div>
</div>

<style>
	#container {
		height: 100%;
	}

	#all-subtitles-list {
		height: 40%;
		overflow: scroll;
	}

	#saved-subtitles-list {
		height: 60%;
		overflow: scroll;
	}

	.subtitle-row {
		display: flex;
		flex-direction: row;
		row-gap: 5px;
	}

	.delete-button {
		background-color: black;
		border-style: none;
		cursor: pointer;
	}

	.delete-button:hover {
		background-color: rgba(255, 0, 0, 0.3);
	}

	.delete-button:focus {
		outline: none;
	}
</style>
