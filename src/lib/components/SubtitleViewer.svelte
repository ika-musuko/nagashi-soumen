<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import SubtitleItem from './SubtitleItem.svelte';
	import type { Subtitle } from '../models/Subtitle';
	import { count, scrollContainerToItem } from '../utils/utils';

	export let subs: Subtitle[];
	$: subs, makeActiveCuesVisible();

	export function makeSavedSubtitleVisible(id: string) {
		const savedSubForView = document.getElementById(`saved-subtitle-row-${id}`);
		if (savedSubForView) {
			scrollContainerToItem(savedSubtitleListElement, savedSubForView);
		}
	}

	let userScrolling: boolean = false;
	async function tempDisableAutoscroll() {
		if (userScrolling) return;
		userScrolling = true;
		await new Promise((resolve) => setTimeout(resolve, 5000));
		userScrolling = false;
		makeActiveCuesVisible();
	}

	function makeActiveCuesVisible() {
		if (userScrolling) {
			return;
		}

		const activeSubs: Subtitle[] = subs.filter((sub) => sub.active);
		if (activeSubs.length < 1) return;

		const activeSubForView = document.getElementById(
			`subtitle-row-${activeSubs[0].id}`
		);

		if (activeSubForView) {
			scrollContainerToItem(subtitleListElement, activeSubForView);
		}
	}

	// this is needed to make sure the timestamps don't get copied on chrome
	// chrome has a bug where it copies text from user-select: none;
	// https://bugs.chromium.org/p/chromium/issues/detail?id=850685
	// when this gets fixed, this hack can be removed
	function copyOnlySubtitles(event: ClipboardEvent) {
		const selection = window.getSelection();
		if (!selection) return;

		let finalClipboardContents = '';

		for (let i = 0; i < selection.rangeCount; i++) {
			const fragment = selection.getRangeAt(i).cloneContents();
			const subtitleRows = Array.from(
				fragment.querySelectorAll('.subtitle-text')
			);
			finalClipboardContents += subtitleRows.map((row) => row.textContent);
		}

		event.clipboardData?.setData('text/plain', finalClipboardContents);
		event.preventDefault();
	}

	const dispatch = createEventDispatcher();
	function handleSeek(t: number) {
		dispatch('seek', { time: t });
	}

	function handleUnsave(sub: Subtitle) {
		dispatch('unsave', { sub: sub });
	}

	let subtitleListElement: HTMLElement;
	let savedSubtitleListElement: HTMLElement;
</script>

<div id="container" on:copy={copyOnlySubtitles}>
	<div
		id="all-subtitles-list"
		bind:this={subtitleListElement}
		on:wheel={tempDisableAutoscroll}
	>
		{#each subs as sub}
			<span id="subtitle-row-{sub.id}">
				<SubtitleItem
					bind:startTime={sub.startTime}
					bind:text={sub.text}
					active={sub.active}
					on:click={() => handleSeek(sub.startTime)}
				/>
			</span>
		{/each}
	</div>
	<hr />
	<div>{count(subs, (sub) => sub.saved)}</div>
	<div id="saved-subtitles-list" bind:this={savedSubtitleListElement}>
		{#each subs as sub}
			{#if sub.saved}
				<span
					id="saved-subtitle-row-{sub.id}"
					class="subtitle-row saved-subtitle-row"
				>
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

	.saved-subtitle-row {
		animation-name: new-saved-subtitle;
		animation-duration: 1s;
	}

	@keyframes new-saved-subtitle {
		from {
			background-color: #555555;
		}
		to {
			background-color: inherit;
		}
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
