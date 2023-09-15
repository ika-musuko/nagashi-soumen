<script lang="ts">
  export let videoSrc: string;
  export let subtitleSrc: string;
  export let currentTime: number = 0;

  export let cues: TextTrackCueList;
  export let lastCueIndex: number;

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
      let track = videoElement.textTracks[0];
      track.mode = "showing";
      cues = track.cues;
    }
  }

  let videoElement: HTMLMediaElement;
  let skipSeconds = 1;

  function getCurrentCueIndex(): number {
    let currentCueIndex = -1;
    for (const activeCue of videoElement.textTracks[0].activeCues) {
      currentCueIndex = Number(activeCue.id) - 1;
    }
    return currentCueIndex;
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
          let currentCueIndex = getCurrentCueIndex();
          if (currentCueIndex !== -1) {
            lastCueIndex = currentCueIndex;
          }
        }}
      />
    {/if}
  </video>
  <div />
{/if}

<style></style>
