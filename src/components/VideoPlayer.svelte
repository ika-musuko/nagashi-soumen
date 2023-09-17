<script lang="ts">
  import type { VTTCueMap } from "../utils/VTTCueMap";

  export let videoSrc: string;
  export let subtitleSrc: string;
  export let currentTime: number;
  export let endTime: number;

  export let cues: TextTrackCueList;
  export let originalCues: VTTCueMap;
  export let lastCueId: string;

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

  $: {
    if (subtitleSrc) {
      updateCues();
    }
  }

  function updateCues() {
    if (!videoElement) return;

    let track = videoElement.textTracks[0];
    if (!track) return;

    track.mode = "showing";
    cues = track.cues;
  }

  let videoElement: HTMLMediaElement;
  let trackElement: HTMLTrackElement;
  let skipSeconds = 1;

  function getCurrentCueId(): string {
    let currentCueId = "";
    for (const activeCue of videoElement.textTracks[0].activeCues) {
      currentCueId = activeCue.id;
    }
    return currentCueId;
  }
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
>
  <track
    bind:this={trackElement}
    id="subs"
    kind="subtitles"
    src={subtitleSrc ? subtitleSrc : ""}
    on:load={() => {
      originalCues.setCues(cues);
    }}
    on:cuechange={() => {
      let currentCueId = getCurrentCueId();
      if (currentCueId !== "") {
        lastCueId = currentCueId;
      }
    }}
  />
</video>

<style></style>
