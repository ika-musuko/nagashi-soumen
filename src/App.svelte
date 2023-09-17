<script lang="ts">
  import VideoPlayer from "./components/VideoPlayer.svelte";
  import Controls from "./components/Controls.svelte";
  import SubtitleViewer from "./components/SubtitleViewer.svelte";
  import SavedSubtitles from "./components/SavedSubtitles.svelte";

  import { SUBTITLE_EXTENSIONS } from "./utils/subtitle-extensions";
  import { VIDEO_EXTENSIONS } from "./utils/video-extensions";
  import type { ComponentEvents } from "svelte";
  import { VTTCueMap } from "./utils/VTTCueMap";

  let DEBUG = true;

  let videoPlayer: VideoPlayer;
  let videoSrc: string;
  let subtitleSrc: string;

  let currentTime: number;
  let subtitleOffset: number = 0.0;
  $: subtitleOffset, retimeCues();

  let cues: TextTrackCueList;
  let originalCues: VTTCueMap = new VTTCueMap();
  let lastCueId: string = "";
  function retimeCues() {
    if (!cues || !isFinite(subtitleOffset)) return;

    for (let cue of cues) {
      const originalCue = originalCues.get(cue.id);
      if (!originalCue) continue;
      cue.startTime = originalCue.startTime + subtitleOffset;
      cue.endTime = originalCue.endTime + subtitleOffset;
    }
  }

  let savedSubtitles: SavedSubtitles;

  function fileUpload(event) {
    const files: FileList = event.target.files;
    if (!files) {
      return;
    }

    // store values from files in buffers
    // to prevent unnecessary reactivity calls
    // if these values are still null
    let videoSrcBuffer: string = null;
    let subtitleSrcBuffer: string = null;

    for (const file of files) {
      const ext = file.name.split(".").pop();
      if (VIDEO_EXTENSIONS.has(ext)) {
        videoSrcBuffer = URL.createObjectURL(file);
      } else if (SUBTITLE_EXTENSIONS.has(ext)) {
        subtitleSrcBuffer = URL.createObjectURL(file);
      }
    }

    if (videoSrcBuffer) videoSrc = videoSrcBuffer;
    if (subtitleSrcBuffer) subtitleSrc = subtitleSrcBuffer;
  }

  function saveCurrentSubtitle() {
    if (cues && lastCueId && lastCueId !== "") {
      let currentSub = cues.getCueById(lastCueId) as VTTCue;
      savedSubtitles.saveSubtitle(currentSub);
    }
  }

  function handleSubtitleSeek(event: ComponentEvents<SubtitleViewer>["seek"]) {
    if (!videoPlayer) {
      return;
    }

    videoPlayer.seek(event.detail.time);
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

      case "ArrowDown":
        e.preventDefault();
        saveCurrentSubtitle();
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
        bind:videoSrc
        bind:subtitleSrc
        bind:currentTime
        bind:cues
        bind:originalCues
        bind:lastCueId
      />
    </span>

    <span id="sidebar">
      {#if DEBUG}
        <span id="debug-area">
          <p class="debug-text">videoSrc: {videoSrc}</p>
          <p class="debug-text">subtitleSrc: {subtitleSrc}</p>
        </span>
      {/if}
      {#if videoPlayer}
        <span id="controls">
          <Controls bind:currentTime bind:subtitleOffset />
        </span>
        <span id="subtitle-viewer">
          <SubtitleViewer
            bind:cues
            bind:lastCueId
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
