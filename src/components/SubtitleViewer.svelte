<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay } from "../utils/utils";
  import type { VTTCueMap } from "../subtitles/VTTCueMap";

  export let cues: VTTCueMap;
  export let activeCueIds: Set<string>;

  const dispatch = createEventDispatcher();

  function handleSeek(t: number) {
    dispatch("seek", { time: t });
  }
</script>

{#if cues}
  <ul id="subtitle-list" style="">
    {#each cues.toArray() as [id, cue]}
      <!-- svelte-ignore a11y-positive-tabindex -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- prettier-ignore -->
      <li
        id="subtitle-{id}"
        class="subtitle"
        tabindex="-1"
        on:click={() => handleSeek(cue.startTime)}
      >
        <span style="user-select: none; font-size: small;">
          {timeDisplay(cue.startTime)}:&nbsp;
        </span>
        {cue.text} 
      </li>
    {/each}
  </ul>
{/if}

<style>
  #subtitle-list {
    max-height: 100%;
    overflow: auto;
    list-style: none;
  }

  .subtitle {
    cursor: pointer;
  }
</style>
