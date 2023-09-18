<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay } from "../utils/utils";

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
  <h3 id="title">Saved Subtitles</h3>
  <ul id="subtitle-list" bind:this={savedSubtitlesElement}>
    {#each Array.from(savedSubtitles) as sub}
      <li style="display: flex; flex-direction: row">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => handleSeek(sub.startTime)}>
          <span style="user-select: none; font-size: small;">
            {timeDisplay(sub.startTime)}:&nbsp;
          </span>
          <span>{sub.text}</span>
        </span>
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

  #title {
    padding: 0px;
    margin: 0px;
  }

  ul {
    overflow: auto;
    list-style: none;
  }

  li {
    cursor: pointer;
    color: #88aaff;
    margin: 10px 0;
  }

  li:focus {
    color: #aaff88;
  }

  /*
  .delete-sub-button {
    user-select: none;
    padding: 0;
  }
  */
</style>
