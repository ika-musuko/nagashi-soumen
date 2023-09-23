<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay } from "../utils/utils";
  import SubtitleItem from "./SubtitleItem.svelte";

  export function saveSubtitle(sub: VTTCue) {
    savedSubtitles.add(sub);
    savedSubtitles = savedSubtitles; // to notify svelte of the update

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

  let savedSubtitles = new Set<VTTCue>();

  let savedSubtitlesElement: HTMLUListElement;
</script>

<hr />
<ul id="subtitle-list" bind:this={savedSubtitlesElement}>
  {#each Array.from(savedSubtitles) as sub}
    <SubtitleItem
      bind:startTime={sub.startTime}
      bind:text={sub.text}
      on:click={() => handleSeek(sub.startTime)}
    />
  {/each}
</ul>

<style>
</style>
