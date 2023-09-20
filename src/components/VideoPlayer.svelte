<script lang="ts">
  import { filterActive } from "../subtitles/Subtitles";
  import type { VTTCueMap } from "../subtitles/VTTCueMap";

  export let DEBUG: boolean;

  export let videoSrc: string;
  export let currentTime: number;
  export let endTime: number;

  export let cues: VTTCueMap;
  export let activeCueIds: Set<string>;

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

  export function fullscreen() {
    if (document.fullscreenElement === null) {
      videoContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  export function toggleSubtitles() {
    cueContainerVisible = !cueContainerVisible;
  }

  let videoContainer: HTMLElement;
  let videoElement: HTMLVideoElement;

  let cueContainerVisible: boolean;

  let skipSeconds = 1;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<div id="video-container" bind:this={videoContainer}>
  <video
    id="video-player"
    class={DEBUG ? "rainbow" : ""}
    bind:this={videoElement}
    on:durationchange={() => {
      endTime = videoElement.duration;
    }}
    on:timeupdate={() => {
      currentTime = videoElement.currentTime;
    }}
    preload="auto"
    src={videoSrc ? videoSrc : ""}
  />
  {#if cueContainerVisible}
    <div id="cue-container">
      {#if DEBUG} <div class="cue-text">テスト字幕。こんにちは！</div> {/if}
      {#each filterActive(cues, activeCueIds) as cue}
        <div class="cue-text">{cue.text}</div>
      {/each}
    </div>
  {/if}
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
    border-radius: 1vw;
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
    border-radius: 1vw;
    padding: 0.1vw 1vw;
  }
</style>
