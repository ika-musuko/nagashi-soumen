<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay } from "../utils/utils";

  export let cues: TextTrackCueList;
  export let lastCueId: string;

  const dispatch = createEventDispatcher();

  function handleSeek(t: number) {
    dispatch("seek", { time: t });
  }

  $: {
    cues = cues;
    if (lastCueId !== undefined && lastCueId !== "") {
      let currentSubtitleElement = document.getElementById(
        `subtitle-${lastCueId}`
      );
      if (currentSubtitleElement) currentSubtitleElement.focus();
    }
  }
</script>

{#if cues}
  <ul id="subtitle-list" style="">
    {#each cues as cue}
      <!-- svelte-ignore a11y-positive-tabindex -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- prettier-ignore -->
      <li
        id="subtitle-{cue.id}"
        class="subtitle"
        tabindex="-1"
        on:click={() => handleSeek(cue.startTime)}
      >
        <!-- 
          typescript complains because cue is a TextTrackCue, 
          which does not have a text property. but actually cue 
          is a VTTCue so the text property exists. 
        -->
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

  .subtitle:focus {
    color: red;
  }
</style>
