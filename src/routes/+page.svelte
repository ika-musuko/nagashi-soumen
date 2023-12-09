<script lang="ts">
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import SubtitleViewer from '$lib/components/SubtitleViewer.svelte';

	import { SUBTITLE_EXTENSIONS } from '$lib/utils/subtitle-extensions';
	import { VIDEO_EXTENSIONS } from '$lib/utils/video-extensions';
	import type { Subtitle } from '$lib/models/Subtitle';
	import type { Loop } from '$lib/models/Loop';
	import { Subtitles } from '$lib/models/Subtitles';
	import { SavedSubtitleStorage } from '$lib/models/SavedSubtitleStorage';

	import { tick, type ComponentEvents } from 'svelte';
	import { downloadSRT, fromSRT } from '$lib/utils/subtitle-io';
	import { filedrop } from '$lib/actions/filedrop';

	let DEBUG = false;

	// svelte components
	let videoPlayer: VideoPlayer | null = null;
	let subtitleViewer: SubtitleViewer | null = null;

	// raw html elements
	let mainContainer: HTMLElement | null = null;
	let fileInput: HTMLInputElement | null = null;

	// data
	let fileDropzoneDragged: boolean = false;

	let showSidebar: boolean = true;
	let showFileUpload: boolean = false;

	let videoSrc: string = '';

	let subtitles = new Subtitles();

	let savedSubtitleStorage: SavedSubtitleStorage | null = null;

	let currentTime: number = 0;
	$: currentTime, $subtitles.updateActive(currentTime);
	let endTime: number = 0;
	
	let loop: Loop = { enabled: false, start: 0, end: 0 };

	let subtitleOffset: number = 0.0;
	$: subtitleOffset, $subtitles.retime(subtitleOffset, currentTime);

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const files: FileList | null = input.files;
		if (!files) return;
		fileUpload(files);
	}

	function handleFileDrop(event: CustomEvent<any>) {
		fileUpload(event.detail.files);
	}

	async function fileUpload(files: FileList) {
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
		if (videoPlayer === null) {
			return;
		}

		loop.enabled = false;
		videoPlayer.seek(event.detail.time);
	}

	function handleSubtitleUnsave(
		event: ComponentEvents<SubtitleViewer>['unsave']
	) {
		$subtitles.unsave(event.detail.sub);
	}

	function toggleFullscreen() {
		if (document.fullscreenElement === null && mainContainer !== null) {
			mainContainer.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	function toggleSubtitles() {
		if (videoPlayer === null) return;
		videoPlayer.toggleSubtitles();
	}

	async function saveActiveSubtitles() {
		const saved: Subtitle[] = $subtitles.saveActive();
		if (savedSubtitleStorage !== null) {
			savedSubtitleStorage.store(subtitles.subs.filter((s) => s.saved));
		}

		await tick();
		if (saved.length > 0 && subtitleViewer !== null) {
			subtitleViewer.makeSavedSubtitleVisible(saved[0].id);
		}
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

	function toggleLoopCurrentSub() {
		if (videoPlayer === null) return;
		
		if (loop.enabled) {
			loop.enabled = false;
		} else {
			const currentSub = subtitles.currentSub(currentTime);
			loop.enabled = true;
			loop.start = currentSub.startTime;
			loop.end = currentSub.endTime;
		}
	}

	function navigateCurrentSub() {
		if (videoPlayer === null) return;

		let jumpTo: number | null = subtitles.currentSub(currentTime).startTime;
		if (typeof jumpTo === 'number') videoPlayer.seek(jumpTo);
	}

	function navigateNextSub() {
		if (videoPlayer === null) return;

		let jumpTo: number | null = subtitles.nextSubTime(currentTime);
		if (typeof jumpTo === 'number') videoPlayer.seek(jumpTo);
	}

	function navigatePrevSub() {
		if (videoPlayer === null) return;

		let jumpTo: number | null = subtitles.prevSubTime(currentTime);
		if (typeof jumpTo === 'number') videoPlayer.seek(jumpTo);
	}

	function onKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case '/':
				event.preventDefault();
				DEBUG = !DEBUG;
				break;

			case 'o':
				event.preventDefault();
				if (fileInput === null) break;
				fileInput.click();
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
			case 'a':
				event.preventDefault();
				if (videoPlayer === null) break;
				videoPlayer.rewind();
				break;

			case 'd':
				event.preventDefault();
				if (videoPlayer === null) break;
				videoPlayer.fastforward();
				break;

			case ' ':
				event.preventDefault();
				if (videoPlayer === null) break;
				videoPlayer.playpause();
				break;

			case 'h':
				event.preventDefault();
				if (videoPlayer === null) break;
				videoPlayer.toggleVisibility();
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
			
			case 'l':
				event.preventDefault();
				toggleLoopCurrentSub();

			case 'r':
				event.preventDefault();
				navigateCurrentSub();
				break;

			case 'w':
				event.preventDefault();
				navigatePrevSub();
				break;

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

<div
	id="file-dropzone"
	class={fileDropzoneDragged
		? 'file-dropzone-dragged'
		: 'file-dropzone-undragged'}
	use:filedrop
	on:filedrop={handleFileDrop}
/>
<svelte:document
	on:dragover|preventDefault={() => {
		fileDropzoneDragged = true;
	}}
	on:dragleave|preventDefault={(e) => {
		if (!!e.relatedTarget) return;
		fileDropzoneDragged = false;
	}}
	on:drop|preventDefault={() => {
		fileDropzoneDragged = false;
	}}
/>

<main bind:this={mainContainer}>
	<span id="video-upload-container">
		<input 
			bind:this={fileInput}
			type="file" 
			multiple 
			class="{showFileUpload ? "" : "hide"}"
			on:change|preventDefault={handleFileInput} />
		<span id="video-player">
			<VideoPlayer
				bind:this={videoPlayer}
				bind:DEBUG
				bind:videoSrc
				bind:currentTime
				bind:endTime
				bind:loop
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
					bind:this={subtitleViewer}
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

	#file-dropzone {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 999;
	}

	.file-dropzone-undragged {
		display: none;
	}

	.file-dropzone-dragged {
		display: block;
		background: rgba(0, 0, 128, 0.5);
		border: 1px solid #999999;
		outline: 2px dashed #999999;
		outline-offset: -10px;
	}

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
