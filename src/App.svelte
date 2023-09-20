<script lang="ts">
  import VideoPlayer from "./components/VideoPlayer.svelte";
  import Controls from "./components/Controls.svelte";
  import SubtitleViewer from "./components/SubtitleViewer.svelte";
  import SavedSubtitles from "./components/SavedSubtitles.svelte";

  import { SUBTITLE_EXTENSIONS } from "./utils/subtitle-extensions";
  import { VIDEO_EXTENSIONS } from "./utils/video-extensions";
  import type { ComponentEvents } from "svelte";
  import { VTTCueMap } from "./subtitles/VTTCueMap";
  import toWebVTT from "srt-webvtt";
  import { Subtitles, filterActive } from "./subtitles/Subtitles";

  let DEBUG = false;

  let videoPlayer: VideoPlayer;
  let videoSrc: string;

  let subtitles: Subtitles = new Subtitles();

  let currentTime: number;
  $: currentTime, $subtitles.updateTime(currentTime);
  let endTime: number;

  let subtitleOffset: number = 0.0;
  $: subtitleOffset, $subtitles.retime(subtitleOffset, currentTime);

  let savedSubtitles: SavedSubtitles;

  async function fileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files: FileList = input.files;
    if (!files) {
      return;
    }

    // store values from files in buffers
    // to prevent unnecessary reactivity calls
    // if these values are still null
    let videoURL: string = null;
    let subtitleURL: string = null;

    for (const file of files) {
      const ext = file.name.split(".").pop();
      if (VIDEO_EXTENSIONS.has(ext)) {
        videoURL = URL.createObjectURL(file);
      } else if (SUBTITLE_EXTENSIONS.has(ext)) {
        subtitleURL = await processSubtitleUpload(file, ext);
      }
    }

    if (videoURL) {
      videoSrc = videoURL;
    }

    if (subtitleURL) {
      $subtitles.constructFromURL(subtitleURL);
    }

    // ===
    async function processSubtitleUpload(
      file: File,
      ext: string
    ): Promise<string> {
      if (ext === "srt") {
        const convertedURL = await toWebVTT(file);
        return convertedURL;
      }
      return URL.createObjectURL(file);
    }
  }

  function handleSubtitleSeek(event: ComponentEvents<SubtitleViewer>["seek"]) {
    if (!videoPlayer) {
      return;
    }

    videoPlayer.seek(event.detail.time);
  }

  function saveCurrentSubtitles() {
    for (const cue of filterActive($subtitles.cues, $subtitles.activeCueIds)) {
      savedSubtitles.saveSubtitle(cue);
    }
  }

  async function navigateNextSub() {
    await subtitles.navigateNext(currentTime);
  }

  async function navigatePrevSub() {
    await subtitles.navigatePrev(currentTime);
  }

  async function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "d":
        event.preventDefault();
        DEBUG = !DEBUG;
        break;

      // video
      case "ArrowLeft":
        event.preventDefault();
        videoPlayer.rewind();
        break;

      case "ArrowRight":
        event.preventDefault();
        videoPlayer.fastforward();
        break;

      case " ":
        event.preventDefault();
        videoPlayer.playpause();
        break;

      case "f":
        event.preventDefault();
        videoPlayer.fullscreen();
        break;

      // subtitles
      case "s":
        event.preventDefault();
        saveCurrentSubtitles();
        break;

      case "ArrowUp":
        event.preventDefault();
        await navigatePrevSub();
        break;

      case "ArrowDown":
        event.preventDefault();
        await navigateNextSub();
        break;

      case "[":
        event.preventDefault();
        subtitleOffset -= 0.05;
        break;

      case "]":
        event.preventDefault();
        subtitleOffset += 0.05;
        break;
    }
  }
</script>

<main>
  <input type="file" multiple on:change|preventDefault={fileUpload} />
  <br />
  <span id="main-container">
    <span id="video-player">
      <VideoPlayer
        bind:this={videoPlayer}
        bind:DEBUG
        bind:videoSrc
        bind:currentTime
        bind:endTime
        bind:cues={$subtitles.cues}
        bind:activeCueIds={$subtitles.activeCueIds}
      />
    </span>

    <span id="sidebar">
      {#if DEBUG}
        <span id="debug-area">
          <p class="debug-text">videoSrc: {videoSrc}</p>
        </span>
      {/if}
      {#if videoPlayer}
        <span id="controls">
          <Controls bind:currentTime bind:endTime bind:subtitleOffset />
        </span>
        <span id="subtitle-viewer">
          <SubtitleViewer
            bind:cues={$subtitles.cues}
            bind:activeCueIds={$subtitles.activeCueIds}
            on:seek={handleSubtitleSeek}
          />
        </span>
        <br />
        <span id="saved-subtitles"
          ><SavedSubtitles
            bind:this={savedSubtitles}
            on:seek={handleSubtitleSeek}
          />
        </span>
      {/if}
    </span>
  </span>
</main>
<svelte:window on:keydown={onKeyDown} />

<style>
  #main-container {
    display: flex;
    flex-direction: row;
  }

  #video-player {
    height: 100vw;
    width: 80vw;
  }

  #sidebar {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    width: 20vw;
  }

  #debug-area {
    max-height: 10%;
    overflow: auto;
  }

  .debug-text {
    font-size: xx-small;
  }

  #controls {
    max-height: 10%;
  }

  #subtitle-viewer {
    height: 25%;
  }

  #saved-subtitles {
    max-height: 55%;
  }
</style>
