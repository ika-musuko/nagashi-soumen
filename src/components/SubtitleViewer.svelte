<script lang="ts">
  import { timeDisplay } from "../utils/utils";

  export let cues: TextTrackCueList;
  export let lastCueId: string;

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
      <!--<option value={cue.id} selected={cue.id === lastCueId}>{cue.text}</option>-->
      <!-- svelte-ignore a11y-positive-tabindex -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- svelte-ignore a11y-autofocus -->
      <li id="subtitle-{cue.id}" class="subtitle" tabindex="-1">
        {timeDisplay(cue.startTime)}: {cue.text}
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
