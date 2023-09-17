<script lang="ts">
  import { timeDisplay } from "../utils/utils";

  export let currentTime: number;
  export let subtitleOffset: number;
  function formatSubtitleOffset(event: Event) {
    let input = event.target as HTMLInputElement;
    if (!input) return;

    const dataFloat = parseFloat(input.value);
    if (isNaN(dataFloat)) return;

    subtitleOffset = dataFloat;
    input.value = dataFloat.toFixed(2);
  }
</script>

<div id="container">
  <p>{timeDisplay(currentTime)}</p>
  <input
    id="subtitle-offset"
    type="number"
    step="0.05"
    value={subtitleOffset.toFixed(2)}
    on:change={formatSubtitleOffset}
  />
</div>

<style>
  * {
    font-size: small;
  }

  #container {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }

  #subtitle-offset {
    width: 6vw;
    height: 3vw;
  }
</style>
