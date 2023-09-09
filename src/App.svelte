<script lang="ts">
  import VideoPlayer from "./components/VideoPlayer.svelte";
  import { VIDEO_EXTENSIONS } from "./utils/video-extensions";

  let files: FileList;
  let videoPlayer: VideoPlayer;
  let videoSrc: string;

  $: if (files) {
    for (const file of files) {
      const ext = file.name.split(".").pop();
      if (VIDEO_EXTENSIONS.has(ext)) {
        videoSrc = URL.createObjectURL(file);
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
</main>
<svelte:window on:keydown={onKeyDown} />

<style></style>
