<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Subtitle } from '../models/Subtitle';
	import SubtitleItem from './SubtitleItem.svelte';

	export let savedSubtitles: Subtitle[];

	const dispatch = createEventDispatcher();

	function handleSeek(t: number) {
		dispatch('seek', { time: t });
	}

	function handleDelete(sub: Subtitle) {
		dispatch('delete', { sub: sub });
	}
</script>

<hr />
<div>{savedSubtitles.length}</div>
<div id="subtitle-list">
	{#each savedSubtitles as sub}
		<span class="subtitle-row">
			<button class="delete-button" on:click={() => handleDelete(sub)}>╳</button
			>
			<SubtitleItem
				bind:startTime={sub.startTime}
				bind:text={sub.text}
				on:click={() => handleSeek(sub.startTime)}
			/>
		</span>
	{/each}
</div>

<style>
	#subtitle-list {
		max-height: 100%;
		overflow: auto;
		list-style: none;
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
