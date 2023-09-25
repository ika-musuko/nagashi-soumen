<script lang="ts">
	import VideoPlayer from '../components/VideoPlayer.svelte';
	import SubtitleViewer from '../components/SubtitleViewer.svelte';
	import SavedSubtitleViewer from '../components/SavedSubtitleViewer.svelte';

	import { SUBTITLE_EXTENSIONS } from '../utils/subtitle-extensions';
	import { VIDEO_EXTENSIONS } from '../utils/video-extensions';
	import type { ComponentEvents } from 'svelte';
	import toWebVTT from 'srt-webvtt';
	import { Subtitles, filterActive } from '../subtitles/Subtitles';

	let DEBUG = false;

	let mainContainer: HTMLElement;

	let showSidebar: boolean = true;
	let showFileUpload: boolean = true;

	let videoPlayer: VideoPlayer;
	let videoSrc: string;

	let subtitles = new Subtitles();

	let currentTime: number;
	$: currentTime, $subtitles.updateActive(currentTime);
	let endTime: number;

	let subtitleOffset: number = 0.0;
	$: subtitleOffset, $subtitles.retime(subtitleOffset, currentTime);

	let savedSubtitleViewer: SavedSubtitleViewer;

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
		let subtitleURL: string | null = null;

		let subtitleFilename: string | null = null;
		for (const file of files) {
			const ext: string | undefined = file.name.split('.').pop();
			if (ext === undefined) continue;

			if (VIDEO_EXTENSIONS.has(ext)) {
				videoURL = URL.createObjectURL(file);
			} else if (SUBTITLE_EXTENSIONS.has(ext)) {
				subtitleURL = await processSubtitleUpload(file, ext);
				subtitleFilename = file.name;
			}
		}

		if (videoURL) {
			videoSrc = videoURL;
		}

		if (subtitleURL) {
			$subtitles.constructFromURL(subtitleURL);
			if (subtitleFilename) {
				savedSubtitleViewer.retrieveSavedSubs(subtitleFilename);
			}
		}

		// ===
		async function processSubtitleUpload(file: File, ext: string): Promise<string> {
			if (ext === 'srt') {
				const convertedURL = await toWebVTT(file);
				return convertedURL;
			}
			return URL.createObjectURL(file);
		}
	}

	function handleSubtitleSeek(event: ComponentEvents<SubtitleViewer>['seek']) {
		if (!videoPlayer) {
			return;
		}

		videoPlayer.seek(event.detail.time);
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

	function saveCurrentSubtitles() {
		for (const cue of filterActive($subtitles.subs, $subtitles.activeSubIds)) {
			savedSubtitleViewer.saveSubtitle(cue);
		}
	}

	function copySavedSubtitles() {
		let allSavedSubs: string = savedSubtitleViewer.allAsString();
		navigator.clipboard.writeText(allSavedSubs);
	}

	function saveSubtitleFile() {
		subtitles.saveToFile();
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
			case 'd':
				event.preventDefault();
				DEBUG = !DEBUG;
				break;

			// pane visibility
			case 'u':
				event.preventDefault();
				showFileUpload = !showFileUpload;
				break;

			case 's':
				event.preventDefault();
				showSidebar = !showSidebar;
				break;

			// video
			case 'ArrowLeft':
			case 'h':
				event.preventDefault();
				videoPlayer.rewind();
				break;

			case 'ArrowRight':
			case 'l':
				event.preventDefault();
				videoPlayer.fastforward();
				break;

			case ' ':
				event.preventDefault();
				videoPlayer.playpause();
				break;

			case 'f':
				event.preventDefault();
				toggleFullscreen();
				break;

			// subtitles
			case 't':
				event.preventDefault();
				toggleSubtitles();
				break;

			case 'i':
				event.preventDefault();
				saveCurrentSubtitles();
				copySavedSubtitles();
				break;

			case 'y':
				event.preventDefault();
				copySavedSubtitles();
				break;

			case 'w':
				event.preventDefault();
				saveSubtitleFile();
				break;

			case 'ArrowUp':
			case 'k':
				event.preventDefault();
				navigatePrevSub();
				break;

			case 'ArrowDown':
			case 'j':
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
				bind:activeSubIds={$subtitles.activeSubIds}
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
					bind:activeSubIds={$subtitles.activeSubIds}
					on:seek={handleSubtitleSeek}
				/>
			</span>
			<span id="saved-subtitles">
				<SavedSubtitleViewer bind:this={savedSubtitleViewer} on:seek={handleSubtitleSeek} />
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
		height: 100vh;
		min-width: 27vw;
		width: 20%;
	}

	#subtitle-viewer {
		height: 40%;
	}

	#saved-subtitles {
		height: 60%;
	}

	#debug-area {
		max-height: 10%;
		overflow: auto;
	}

	.debug-text {
		font-size: xx-small;
	}
</style>