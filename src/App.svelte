<script lang="ts">
  import VideoPlayer from "./components/VideoPlayer.svelte";
  import { SUBTITLE_EXTENSIONS } from "./utils/subtitle-extensions";
  import { VIDEO_EXTENSIONS } from "./utils/video-extensions";
  import { timeDisplay } from "./utils/utils";

  let files: FileList;

  let videoPlayer: VideoPlayer;
  let videoSrc: string;
  let subtitleSrc: string;

  let currentTime: number;

  let cues: TextTrackCueList;
  let lastCueIndex: number;

  $: if (files) {
    for (const file of files) {
      const ext = file.name.split(".").pop();
      if (VIDEO_EXTENSIONS.has(ext)) {
        videoSrc = URL.createObjectURL(file);
      } else if (SUBTITLE_EXTENSIONS.has(ext)) {
        subtitleSrc = URL.createObjectURL(file);
      }
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        videoPlayer.rewind();
        break;

      case "ArrowRight":
        e.preventDefault();
        videoPlayer.fastforward();
        break;

      case " ":
        e.preventDefault();
        videoPlayer.playpause();
        break;
    }
  }
</script>

<main>
  <input type="file" bind:files multiple />
  <br />
  <VideoPlayer
    bind:this={videoPlayer}
    bind:videoSrc
    bind:subtitleSrc
    bind:currentTime
    bind:cues
    bind:lastCueIndex
  />
  <p>{timeDisplay(currentTime)}</p>
  <p>last cue index: {lastCueIndex}</p>
  <p>
    last cue text: {cues && lastCueIndex && lastCueIndex > 0
      ? cues[lastCueIndex].text
      : ""}
  </p>
</main>
<svelte:window on:keydown={onKeyDown} />

<style></style>
