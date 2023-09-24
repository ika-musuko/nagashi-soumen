<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay } from "../utils/utils";
  import SubtitleItem from "./SubtitleItem.svelte";

  export function saveSubtitle(sub: VTTCue) {
    savedSubtitles.add(sub);
    savedSubtitles = savedSubtitles; // retrigger

    savedSubtitlesElement.scroll({
      top: savedSubtitlesElement.scrollHeight,
      behavior: "instant",
    });
  }

  export function allAsString(): string {
    return Array.from(savedSubtitles)
      .map((s) => s.text)
      .join("\n\n");
  }

  // if localStorage ends up not being enough space (5-10 MB)
  // implement this in IndexedDB
  export function retrieveSavedSubs(filename: string) {
    subtitleFilename = filename;
    const storedString = localStorage.getItem(subtitleFilename);
    if (!storedString) return;

    const storedArray = JSON.parse(storedString);

    savedSubtitles = new Set<VTTCue>(storedArray);
  }

  function storeSavedSubs() {
    if (!subtitleFilename) return;

    const savedSubtitlesArray = Array.from(savedSubtitles).map((s) => {
      return { startTime: s.startTime, endTime: s.endTime, text: s.text };
    });
    const savedSubtitlesString = JSON.stringify(savedSubtitlesArray);
    console.log(savedSubtitlesArray);
    console.log(savedSubtitlesString);

    window.localStorage.setItem(subtitleFilename, savedSubtitlesString);
  }

  const dispatch = createEventDispatcher();

  function handleSeek(t: number) {
    dispatch("seek", { time: t });
  }

  function deleteSub(sub: VTTCue) {
    savedSubtitles.delete(sub);
    savedSubtitles = savedSubtitles; // retrigger
  }

  let subtitleFilename: string | null = null;
  let savedSubtitles = new Set<VTTCue>();
  $: savedSubtitles, storeSavedSubs();

  let savedSubtitlesElement: HTMLElement;
</script>

<hr />
<div id="subtitle-list" bind:this={savedSubtitlesElement}>
  {#each Array.from(savedSubtitles) as sub}
    <span class="subtitle-row">
      <button class="delete-button" on:click={() => deleteSub(sub)}>╳</button>
      <SubtitleItem
        bind:startTime={sub.startTime}
        bind:text={sub.text}
        on:click={() => handleSeek(sub.startTime)}
      />
    </span>
  {/each}
</div>

<style>
  #subtitle-list {
    max-height: 100%;
    overflow: auto;
    list-style: none;
  }

  .subtitle-row {
    display: flex;
    flex-direction: row;
    row-gap: 5px;
  }

  .delete-button {
    background-color: black;
    border-style: none;
    cursor: pointer;
  }

  .delete-button:hover {
    background-color: rgba(255, 0, 0, 0.3);
  }

  .delete-button:focus {
    outline: none;
  }
</style>
