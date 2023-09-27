<script lang="ts">
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import SubtitleViewer from '$lib/components/SubtitleViewer.svelte';

	import { SUBTITLE_EXTENSIONS } from '$lib/utils/subtitle-extensions';
	import { VIDEO_EXTENSIONS } from '$lib/utils/video-extensions';
	import type { Subtitle } from '$lib/models/Subtitle';
	import { Subtitles } from '$lib/models/Subtitles';
	import { SavedSubtitleStorage } from '$lib/models/SavedSubtitleStorage';

	import type { ComponentEvents } from 'svelte';
	import { downloadSRT, fromSRT } from '$lib/utils/subtitle-io';

	let DEBUG = false;

	let mainContainer: HTMLElement;

	let showSidebar: boolean = true;
	let showFileUpload: boolean = true;

	let videoPlayer: VideoPlayer;
	let videoSrc: string;

	let subtitles = new Subtitles();

	let savedSubtitleStorage: SavedSubtitleStorage;

	let currentTime: number;
	$: currentTime, $subtitles.updateActive(currentTime);
	let endTime: number;

	let subtitleOffset: number = 0.0;
	$: subtitleOffset, $subtitles.retime(subtitleOffset, currentTime);

	async function fileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files: FileList | null = input.files;
		if (!files) {
			return;
		}

		// store values from files in buffers
		// to prevent unnecessary reactivity calls
		// if these values are still null
		let videoURL: string | null = null;

		let subtitleFilename: string | null = null;
		let subtitleFileContents: string | null = null;

		for (const file of files) {
			const ext: string | undefined = file.name.split('.').pop();
			if (ext === undefined) continue;

			if (VIDEO_EXTENSIONS.has(ext)) {
				videoURL = URL.createObjectURL(file);
			} else if (SUBTITLE_EXTENSIONS.has(ext)) {
				subtitleFileContents = await file.text();
				subtitleFilename = file.name;
			}
		}

		if (videoURL) {
			videoSrc = videoURL;
		}

		if (subtitleFileContents && subtitleFilename) {
			const subtitlesArray = fromSRT(subtitleFileContents);
			if (subtitlesArray) {
				subtitles = new Subtitles(subtitlesArray);
				savedSubtitleStorage = new SavedSubtitleStorage(subtitleFilename);
				const retrievedSavedSubs: Subtitle[] = savedSubtitleStorage.retrieve();
				subtitles.saveBatch(retrievedSavedSubs);
			} else {
				alert('error processing subtitles file.');
			}
		}
	}

	function handleSubtitleSeek(event: ComponentEvents<SubtitleViewer>['seek']) {
		if (!videoPlayer) {
			return;
		}

		videoPlayer.seek(event.detail.time);
	}

	function handleSubtitleUnsave(
		event: ComponentEvents<SubtitleViewer>['unsave']
	) {
		$subtitles.unsave(event.detail.sub);
	}

	function toggleFullscreen() {
		if (document.fullscreenElement === null) {
			mainContainer.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	function toggleSubtitles() {
		videoPlayer.toggleSubtitles();
	}

	function saveActiveSubtitles() {
		$subtitles.saveActive();
		savedSubtitleStorage.store(subtitles.subs.filter((s) => s.saved));
	}

	function copySavedSubtitles() {
		let allSavedSubs: string = subtitles.subs
			.filter((s) => s.saved)
			.join('\n\n');
		navigator.clipboard.writeText(allSavedSubs);
	}

	function saveSubtitleFile() {
		downloadSRT('captions.srt', subtitles.subs);
	}

	function navigateNextSub() {
		let jumpTo: number | null = subtitles.nextSubTime(currentTime);
		if (jumpTo) videoPlayer.seek(jumpTo);
	}

	function navigatePrevSub() {
		let jumpTo: number | null = subtitles.prevSubTime(currentTime);
		if (jumpTo) videoPlayer.seek(jumpTo);
	}

	function onKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case '/':
				event.preventDefault();
				DEBUG = !DEBUG;
				break;

			// pane visibility
			case 'u':
				event.preventDefault();
				showFileUpload = !showFileUpload;
				break;

			case '\\':
				event.preventDefault();
				showSidebar = !showSidebar;
				break;

			// video
			case 'ArrowLeft':
			case 'a':
				event.preventDefault();
				videoPlayer.rewind();
				break;

			case 'ArrowRight':
			case 'd':
				event.preventDefault();
				videoPlayer.fastforward();
				break;

			case ' ':
				event.preventDefault();
				videoPlayer.playpause();
				break;

			case 'F11':
				event.preventDefault();
				toggleFullscreen();
				break;

			// subtitles
			case 't':
				event.preventDefault();
				toggleSubtitles();
				break;

			case 'q':
				event.preventDefault();
				saveActiveSubtitles();
				break;

			case 'm':
				event.preventDefault();
				saveSubtitleFile();
				break;

			case 'ArrowUp':
			case 'w':
				event.preventDefault();
				navigatePrevSub();
				break;

			case 'ArrowDown':
			case 's':
				event.preventDefault();
				navigateNextSub();
				break;

			case '[':
				event.preventDefault();
				subtitleOffset -= 0.25;
				break;

			case ']':
				event.preventDefault();
				subtitleOffset += 0.25;
				break;
		}
	}
</script>

<main bind:this={mainContainer}>
	<span id="video-upload-container">
		{#if showFileUpload}
			<input type="file" multiple on:change|preventDefault={fileUpload} />
		{/if}
		<div id="dropzone">
			<!--<Dropzone on:drop={fileUpload} />-->
		</div>
		<span id="video-player">
			<VideoPlayer
				bind:this={videoPlayer}
				bind:DEBUG
				bind:videoSrc
				bind:currentTime
				bind:endTime
				bind:subs={$subtitles.subs}
				bind:subtitleOffset
			/>
		</span>
	</span>

	<span id="sidebar" class:hide={!showSidebar}>
		{#if DEBUG}
			<span id="debug-area">
				<p class="debug-text">videoSrc: {videoSrc}</p>
			</span>
		{/if}
		{#if videoPlayer}
			<span id="subtitle-viewer">
				<SubtitleViewer
					bind:subs={$subtitles.subs}
					on:seek={handleSubtitleSeek}
					on:unsave={handleSubtitleUnsave}
				/>
			</span>
		{/if}
	</span>
</main>
<svelte:window on:keydown={onKeyDown} />

<style>
	main {
		display: flex;
		flex-direction: row;

		justify-content: center;
		align-items: center;

		min-height: 100vh;
	}

	/*
  #dropzone {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 255, 0.5);
    transition: visibility 150ms, opacity, 150ms;
    visibility: hidden;
    opacity: 0;
  }
  */

	#video-player {
		width: 80vw;
	}

	#sidebar {
		display: flex;
		flex-direction: column;
		height: 93vh;
		min-width: 27vw;
		width: 20%;
	}

	#subtitle-viewer {
		height: 100%;
	}

	#debug-area {
		max-height: 10%;
		overflow: auto;
	}

	.debug-text {
		font-size: xx-small;
	}
</style>
