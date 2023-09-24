<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay } from "../utils/utils";
  import type { VTTCueMap } from "../subtitles/VTTCueMap";
  import SubtitleItem from "./SubtitleItem.svelte";

  export let cues: VTTCueMap;
  export let activeCueIds: Set<string>;
  $: activeCueIds, makeActiveCuesVisible();
  function makeActiveCuesVisible() {
    const activeSubs: HTMLCollection =
      document.getElementsByClassName("active-subtitle");
    if (activeSubs.length < 1) return;
    activeSubs[activeSubs.length - 1].scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "instant",
    });
  }

  const dispatch = createEventDispatcher();
  function handleSeek(t: number) {
    dispatch("seek", { time: t });
  }
</script>

{#if cues}
  <div id="subtitle-list">
    {#each cues.toArray() as [id, cue], index}
      <SubtitleItem
        bind:startTime={cue.startTime}
        bind:text={cue.text}
        active={activeCueIds.has(id)}
        on:click={() => handleSeek(cue.startTime)}
      />
    {/each}
  </div>
{/if}

<style>
  #subtitle-list {
    max-height: 100%;
    overflow: auto;
    list-style: none;
  }
</style>
