<script lang="ts">
  export let videoSrc: string;
  export let subtitleSrc: string;
  export let currentTime: number = NaN;

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
</script>

<!-- svelte-ignore a11y-media-has-caption -->
{#if videoSrc}
  <video
    id="video-player"
    bind:this={videoElement}
    on:timeupdate={() => (currentTime = videoElement.currentTime)}
    width="100%"
    height="auto"
    preload="auto"
    src={videoSrc}
  >
    {#if subtitleSrc}
      <track id="subs" kind="subtitles" src={subtitleSrc} />
    {/if}
  </video>
{/if}

<style></style>
