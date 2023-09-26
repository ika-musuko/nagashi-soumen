<script lang="ts">
	import type { Subtitle } from '../models/Subtitle';
	import { filterActive } from '../models/Subtitles';
	import Controls from './Controls.svelte';

	export let DEBUG: boolean;

	export let videoSrc: string;
	export let currentTime: number;
	export let endTime: number;

	export let subs: Subtitle[];
	export let activeSubIds: Set<string>;

	export let subtitleOffset: number;

	export function rewind() {
		videoElement.currentTime -= skipSeconds;
	}

	export function fastforward() {
		videoElement.currentTime += skipSeconds;
	}

	export function playpause() {
		videoElement.paused ? videoElement.play() : videoElement.pause();
	}

	export function seek(time: number) {
		videoElement.currentTime = time;
	}

	export function toggleSubtitles() {
		cueContainerVisible = !cueContainerVisible;
	}

	let videoContainer: HTMLElement;
	let videoElement: HTMLVideoElement;

	let cueContainerVisible: boolean = true;

	let skipSeconds = 1;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<div id="video-container" bind:this={videoContainer}>
	<video
		id="video-player"
		class={DEBUG ? 'rainbow' : ''}
		bind:this={videoElement}
		on:durationchange={() => {
			endTime = videoElement.duration;
		}}
		on:timeupdate={() => {
			currentTime = videoElement.currentTime;
		}}
		preload="auto"
		src={videoSrc ? videoSrc : ''}
	/>
	{#if cueContainerVisible}
		<div id="cue-container">
			{#if DEBUG} <div class="cue-text">テスト字幕。こんにちは！</div> {/if}
			{#each filterActive(subs, activeSubIds) as cue}
				<div class="cue-text">{cue.text}</div>
			{/each}
		</div>
	{/if}

	<span id="controls">
		<Controls
			bind:currentTime
			bind:endTime
			bind:subtitleOffset
			on:seek={(event) => seek(event.detail.time)}
		/>
	</span>
</div>

<style>
	#video-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	#video-player {
		width: 100%;
		height: auto;
	}

	.rainbow {
		background: linear-gradient(
			45deg,
			red,
			orange,
			yellow,
			green,
			blue,
			indigo,
			violet,
			red
		);
		background-size: 50% 50%;
		animation: rainbowAnimation 5s linear infinite;
	}

	@keyframes rainbowAnimation {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}

	#controls {
		position: absolute;
		bottom: -0.4%;
		padding: 0;

		width: 100%;

		background-color: rgba(0, 0, 0, 0.6);

		justify-content: center;
		align-items: center;

		opacity: 0;
		animation: controlsFadeOut 2.5s forwards;
	}

	#controls:hover {
		animation: controlsFadeIn 0.1s forwards;
	}

	@keyframes controlsFadeIn {
		0%,
		1% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes controlsFadeOut {
		0%,
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	#cue-container {
		position: absolute;
		bottom: 5%;
		z-index: 1000;
		display: flex;
		flex-direction: column;
	}

	.cue-text {
		text-align: center;
		font-size: 2vw;
		background-color: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(7px) grayscale(30%) invert(100%);
		color: white;
		border-radius: 0.4vw;
		padding: 0.5vw 1vw;
	}
</style>
