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

  const dispatch = createEventDispatcher();

  function handleSeek(t: number) {
    dispatch("seek", { time: t });
  }

  function deleteSub(sub: VTTCue) {
    savedSubtitles.delete(sub);
    savedSubtitles = savedSubtitles; // retrigger
  }

  let savedSubtitles = new Set<VTTCue>();

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
