<script lang="ts">
  import VideoPlayer from "./components/VideoPlayer.svelte";
  import SubtitleViewer from "./components/SubtitleViewer.svelte";
  import SavedSubtitles from "./components/SavedSubtitles.svelte";
  import { SUBTITLE_EXTENSIONS } from "./utils/subtitle-extensions";
  import { VIDEO_EXTENSIONS } from "./utils/video-extensions";
  import { timeDisplay } from "./utils/utils";
  import type { ComponentEvents } from "svelte";

  let files: FileList;

  let videoPlayer: VideoPlayer;
  let videoSrc: string;
  let subtitleSrc: string;

  let currentTime: number;

  let cues: TextTrackCueList;
  let lastCueId: string = "";

  let savedSubtitles: SavedSubtitles;

  $: {
    if (files) {
      for (const file of files) {
        const ext = file.name.split(".").pop();
        if (VIDEO_EXTENSIONS.has(ext)) {
          videoSrc = URL.createObjectURL(file);
        } else if (SUBTITLE_EXTENSIONS.has(ext)) {
          subtitleSrc = URL.createObjectURL(file);
        }
      }
    }
  }

  function saveCurrentSubtitle() {
    if (cues && lastCueId && lastCueId !== "") {
      let currentSub = (cues.getCueById(lastCueId) as VTTCue).text;
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
  <input type="file" bind:files multiple />
  <br />
  <span id="main-container">
    <span id="video-player">
      <VideoPlayer
        bind:this={videoPlayer}
        bind:videoSrc
        bind:subtitleSrc
        bind:currentTime
        bind:cues
        bind:lastCueId
      />
    </span>

    {#if videoPlayer}
      <span id="sidebar">
        <span id="controls">
          <p>{timeDisplay(currentTime)}</p>
        </span>
        <span id="subtitle-viewer">
          <SubtitleViewer
            bind:cues
            bind:lastCueId
            on:seek={handleSubtitleSeek}
          />
        </span>
        <span id="saved-subtitles"
          ><SavedSubtitles bind:this={savedSubtitles} />
        </span>
      </span>
    {/if}
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

  #controls {
    max-height: 10%;
  }

  #subtitle-viewer {
    height: 50%;
  }

  #saved-subtitles {
    max-height: 40%;
  }
</style>
