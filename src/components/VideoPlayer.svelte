<script lang="ts">
  export let videoSrc: string;
  export let subtitleSrc: string;
  export let currentTime: number = 0;
  export let currentSub: string;
  export let lastSub: string = "";

  export function rewind() {
    videoElement.currentTime -= skipSeconds;
  }

  export function fastforward() {
    videoElement.currentTime += skipSeconds;
  }

  export function playpause() {
    videoElement.paused ? videoElement.play() : videoElement.pause();
  }

  $: {
    if (videoElement) {
      for (let textTrack of videoElement.textTracks) {
        textTrack.mode = "showing";
      }
    }
  }

  let videoElement: HTMLMediaElement;
  let skipSeconds = 1;

  function getCurrentSub() {
    const activeCue = videoElement.textTracks[0].activeCues[0];
    if (activeCue === undefined || !(activeCue instanceof VTTCue)) {
      return "";
    }
    return activeCue.text;
  }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
{#if videoSrc}
  <video
    id="video-player"
    bind:this={videoElement}
    on:timeupdate={() => {
      currentTime = videoElement.currentTime;
    }}
    width="100%"
    height="auto"
    preload="auto"
    src={videoSrc}
  >
    {#if subtitleSrc}
      <track
        id="subs"
        kind="subtitles"
        src={subtitleSrc}
        on:cuechange={() => {
          currentSub = getCurrentSub();
          if (currentSub !== "") {
            lastSub = currentSub;
          }
        }}
      />
    {/if}
  </video>
  <div />
{/if}

<style></style>
