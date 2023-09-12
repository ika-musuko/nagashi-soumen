<script lang="ts">
  export let videoSrc: string;
  export let subtitleSrc: string;
  export function currentTime(): number {
    return videoElement.currentTime;
  }

  let videoElement: HTMLMediaElement;
  let skipSeconds = 1;

  export function rewind() {
    videoElement.currentTime -= skipSeconds;
  }

  export function fastforward() {
    videoElement.currentTime += skipSeconds;
  }

  export function playpause() {
    videoElement.paused ? videoElement.play() : videoElement.pause();
  }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
{#if videoSrc}
  <video
    bind:this={videoElement}
    width="100%"
    height="auto"
    preload="auto"
    src={videoSrc}
    controls
  >
    {#if subtitleSrc}
      <track kind="subtitles" src={subtitleSrc} />
    {/if}
  </video>
{/if}

<style></style>
