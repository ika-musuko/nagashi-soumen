<script lang="ts">
  import { filterActive } from "../subtitles/Subtitles";
  import type { VTTCueMap } from "../subtitles/VTTCueMap";

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

  let videoContainer: HTMLElement;
  let videoElement: HTMLMediaElement;
  let skipSeconds = 1;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<div id="video-container" bind:this={videoContainer}>
  <video
    id="video-player"
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
  <div id="cue-container">
    {#each filterActive(cues, activeCueIds) as cue}
      <div class="cue-text" style="font-size: 2vw;">{cue.text}</div>
    {/each}
  </div>
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

  #cue-container {
    position: absolute;
    bottom: 3vh;
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }

  .cue-text {
    text-align: center;
    background-color: #000000;
    color: #e5e8ff;
    opacity: 0.8;
  }
</style>
