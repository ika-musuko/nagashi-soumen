<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import SubtitleItem from "./SubtitleItem.svelte";
  import type { Subtitle } from "../subtitles/Subtitle";

  export let subs: Subtitle[];
  export let activeSubIds: Set<string>;
  $: activeSubIds, makeActiveCuesVisible();
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

{#if subs}
  <div id="subtitle-list">
    {#each subs as sub}
      <SubtitleItem
        bind:startTime={sub.startTime}
        bind:text={sub.text}
        active={activeSubIds.has(sub.id)}
        on:click={() => handleSeek(sub.startTime)}
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
