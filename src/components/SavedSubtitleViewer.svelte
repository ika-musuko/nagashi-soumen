<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SubtitleItem from './SubtitleItem.svelte';
	import type { Subtitle } from '../subtitles/Subtitle';
	import { SortedSet } from '../utils/SortedSet';

	export function saveSubtitle(sub: Subtitle) {
		if (savedSubtitles.has(sub)) return;

		savedSubtitles.add(sub);
		savedSubtitles = savedSubtitles; // retrigger
	}

	export function allAsString(): string {
		return savedSubtitles.toArray().join('\n\n');
	}

	// if localStorage ends up not being enough space (5-10 MB)
	// implement this in IndexedDB
	export function retrieveSavedSubs(filename: string) {
		subtitleFilename = filename;
		const storedString = localStorage.getItem(subtitleFilename);
		if (!storedString) return;

		const storedArray = JSON.parse(storedString);
		for (const sub of storedArray) {
			savedSubtitles.add(sub);
		}

		savedSubtitles = savedSubtitles; // retrigger
	}

	function storeSavedSubs() {
		if (!subtitleFilename) return;

		const savedSubtitlesString = JSON.stringify(savedSubtitles.toArray());
		window.localStorage.setItem(subtitleFilename, savedSubtitlesString);
	}

	const dispatch = createEventDispatcher();

	function handleSeek(t: number) {
		dispatch('seek', { time: t });
	}

	function deleteSub(sub: Subtitle) {
		savedSubtitles.delete(sub);
		savedSubtitles = savedSubtitles; // retrigger
	}

	let subtitleFilename: string | null = null;

	let savedSubtitles = new SortedSet<Subtitle>(
		(sub: Subtitle) => sub.id,
		(sub: Subtitle) => sub.startTime
	);
	$: savedSubtitles, storeSavedSubs();

	let savedSubtitlesElement: HTMLElement;
</script>

<hr />
<div>{savedSubtitles.size()}</div>
<div id="subtitle-list" bind:this={savedSubtitlesElement}>
	{#each savedSubtitles.toArray() as sub}
		<span class="subtitle-row">
			<button class="delete-button" on:click={() => deleteSub(sub)}>╳</button>
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
