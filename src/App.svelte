<script lang="ts">
  import VideoPlayer from "./components/VideoPlayer.svelte";
  import { SUBTITLE_EXTENSIONS } from "./utils/subtitle-extensions";
  import { VIDEO_EXTENSIONS } from "./utils/video-extensions";

  let files: FileList;

  let videoPlayer: VideoPlayer;
  let videoSrc: string;

  let subtitleSrc: string;

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
  <!-- <input type="file" accept="video/*" bind:files multiple /> -->
  <input type="file" bind:files multiple />
  <br />
  <!-- svelte-ignore a11y-media-has-caption -->
  <VideoPlayer bind:this={videoPlayer} {videoSrc} />
  <p>{subtitleSrc ? subtitleSrc : ""}</p>
</main>
<svelte:window on:keydown={onKeyDown} />

<style></style>
