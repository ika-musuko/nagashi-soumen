<script lang="ts">
  import VideoPlayer from "./components/VideoPlayer.svelte";
  import Controls from "./components/Controls.svelte";
  import SubtitleViewer from "./components/SubtitleViewer.svelte";
  import SavedSubtitles from "./components/SavedSubtitles.svelte";

  import { SUBTITLE_EXTENSIONS } from "./utils/subtitle-extensions";
  import { VIDEO_EXTENSIONS } from "./utils/video-extensions";
  import type { ComponentEvents } from "svelte";
  import toWebVTT from "srt-webvtt";
  import { Subtitles, filterActive } from "./subtitles/Subtitles";

  let DEBUG = false;

  let mainContainer: HTMLElement;

  let showSidebar: boolean = true;
  let showControls: boolean = true;

  let videoPlayer: VideoPlayer;
  let videoSrc: string;

  let subtitles: Subtitles = new Subtitles();

  let currentTime: number;
  $: currentTime, $subtitles.updateActive(currentTime);
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

  function toggleFullscreen() {
    if (document.fullscreenElement === null) {
      mainContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function toggleSubtitles() {
    videoPlayer.toggleSubtitles();
  }

  function saveCurrentSubtitles() {
    for (const cue of filterActive($subtitles.cues, $subtitles.activeCueIds)) {
      savedSubtitles.saveSubtitle(cue);
    }
  }

  function copySavedSubtitles() {
    let allSavedSubs: string = savedSubtitles.allAsString();
    navigator.clipboard.writeText(allSavedSubs);
  }

  function saveSubtitleFile() {
    subtitles.saveToFile();
  }

  function navigateNextSub() {
    let jumpTo: number | null = subtitles.nextSubTime(currentTime);
    if (jumpTo) videoPlayer.seek(jumpTo);
  }

  function navigatePrevSub() {
    let jumpTo: number | null = subtitles.prevSubTime(currentTime);
    if (jumpTo) videoPlayer.seek(jumpTo);
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "d":
        event.preventDefault();
        DEBUG = !DEBUG;
        break;

      // pane visibility
      case "c":
        event.preventDefault();
        showControls = !showControls;
        break;

      case "s":
        event.preventDefault();
        showSidebar = !showSidebar;
        break;

      // video
      case "ArrowLeft":
      case "h":
        event.preventDefault();
        videoPlayer.rewind();
        break;

      case "ArrowRight":
      case "l":
        event.preventDefault();
        videoPlayer.fastforward();
        break;

      case " ":
        event.preventDefault();
        videoPlayer.playpause();
        break;

      case "f":
        event.preventDefault();
        toggleFullscreen();
        break;

      // subtitles
      case "t":
        event.preventDefault();
        toggleSubtitles();
        break;

      case "i":
        event.preventDefault();
        saveCurrentSubtitles();
        copySavedSubtitles();
        break;

      case "y":
        event.preventDefault();
        copySavedSubtitles();
        break;

      case "w":
        event.preventDefault();
        saveSubtitleFile();
        break;

      case "ArrowUp":
      case "k":
        event.preventDefault();
        navigatePrevSub();
        break;

      case "ArrowDown":
      case "j":
        event.preventDefault();
        navigateNextSub();
        break;

      case "[":
        event.preventDefault();
        subtitleOffset -= 0.25;
        break;

      case "]":
        event.preventDefault();
        subtitleOffset += 0.25;
        break;
    }
  }
</script>

<main bind:this={mainContainer}>
  <input type="file" multiple on:change|preventDefault={fileUpload} />
  <br />
  <span style="display: flex; flex-direction: column">
    <span id="video-player">
      <VideoPlayer
        bind:this={videoPlayer}
        bind:DEBUG
        bind:videoSrc
        bind:currentTime
        bind:endTime
        bind:cues={$subtitles.cues}
        bind:activeCueIds={$subtitles.activeCueIds}
        bind:subtitleOffset
      />
    </span>
  </span>

  {#if showSidebar}
    <span id="sidebar">
      {#if DEBUG}
        <span id="debug-area">
          <p class="debug-text">videoSrc: {videoSrc}</p>
        </span>
      {/if}
      {#if videoPlayer}
        <span id="subtitle-viewer">
          <SubtitleViewer
            bind:cues={$subtitles.cues}
            bind:activeCueIds={$subtitles.activeCueIds}
            on:seek={handleSubtitleSeek}
          />
        </span>
        <span id="saved-subtitles"
          ><SavedSubtitles
            bind:this={savedSubtitles}
            on:seek={handleSubtitleSeek}
          />
        </span>
      {/if}
    </span>
  {/if}
</main>
<svelte:window on:keydown={onKeyDown} />

<style>
  main {
    display: flex;
    flex-direction: row;

    justify-content: center;
    align-items: center;

    min-height: 100vh;
  }

  #video-player {
    width: 80vw;
  }

  #sidebar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 45vw;
  }

  #subtitle-viewer {
    height: 40%;
  }

  #saved-subtitles {
    height: 60%;
  }

  #debug-area {
    max-height: 10%;
    overflow: auto;
  }

  .debug-text {
    font-size: xx-small;
  }
</style>
