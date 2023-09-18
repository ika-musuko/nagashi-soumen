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
      videoElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  let videoElement: HTMLMediaElement;
  let skipSeconds = 1;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video
  id="video-player"
  bind:this={videoElement}
  on:durationchange={() => {
    endTime = videoElement.duration;
  }}
  on:timeupdate={() => {
    currentTime = videoElement.currentTime;
  }}
  width="100%"
  height="auto"
  preload="auto"
  src={videoSrc ? videoSrc : ""}
/>
{#each filterActive(cues, activeCueIds) as cue}
  <p>{cue.text}</p>
{/each}

<style></style>
