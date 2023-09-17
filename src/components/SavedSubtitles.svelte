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

  const dispatch = createEventDispatcher();

  function handleSeek(t: number) {
    dispatch("seek", { time: t });
  }

  let savedSubtitles = new Set<VTTCue>();

  let savedSubtitlesElement: HTMLUListElement;
</script>

<div>
  <div style="font-size: large; font-weight: bold">Saved Subtitles</div>
  <ul id="subtitle-list" bind:this={savedSubtitlesElement}>
    {#each Array.from(savedSubtitles) as sub}
      <li style="display: flex; flex-direction: row">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <SubtitleItem
          bind:time={sub.startTime}
          bind:text={sub.text}
          color={"#88aaff"}
          on:click={() => handleSeek(sub.startTime)}
        />
        <!--<button class="delete-sub-button">X</button>-->
      </li>
    {/each}
  </ul>
</div>

<style>
  div {
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }

  ul {
    overflow: auto;
    list-style: none;
  }

  li {
    cursor: pointer;
    margin: 10px 0;
  }

  /*
  .delete-sub-button {
    user-select: none;
    padding: 0;
  }
  */
</style>
