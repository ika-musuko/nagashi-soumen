<script lang="ts">
  export let videoSrc: string;
  export let subtitleSrc: string;
  export let currentTime: number = 0;

  export let cues: TextTrackCueList;
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

  $: {
    if (videoElement) {
      let track = videoElement.textTracks[0];
      if (track) {
        track.mode = "showing";
      }
    }
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
        bind:this={trackElement}
        id="subs"
        kind="subtitles"
        src={subtitleSrc}
        on:cuechange={() => {
          // TODO: find a better place to update the cues
          // this is buggy and only works if the video file and subtitle file are simultaneously uploaded
          let track = videoElement.textTracks[0];
          cues = track.cues;

          let currentCueId = getCurrentCueId();
          if (currentCueId !== "") {
            lastCueId = currentCueId;
          }
        }}
      />
    {/if}
  </video>
  <div />
{/if}

<style></style>
