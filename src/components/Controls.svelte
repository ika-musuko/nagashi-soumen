<script lang="ts">
  import { timeDisplay, floatEquals } from "../utils/utils";

  export let currentTime: number;
  export let endTime: number;

  export let subtitleOffset: number;
  function formatSubtitleOffset(event: Event) {
    let input = event.target as HTMLInputElement;
    if (!input) return;

    const dataFloat = parseFloat(input.value);
    if (isNaN(dataFloat)) return;

    subtitleOffset = dataFloat;

    input.value = dataFloat.toFixed(2);
    if (floatEquals(subtitleOffset, 0.0)) {
      subtitleOffsetSign = "⏺";
    } else {
      if (subtitleOffset > 0) {
        subtitleOffsetSign = "➡️";
      } else {
        subtitleOffsetSign = "⬅️";
      }
    }

    console.log("subtitleOffsetSign: " + subtitleOffsetSign);
  }

  let subtitleOffsetSign: string = "⏺";
</script>

<div id="container">
  <div id="time-display">
    {!isNaN(endTime)
      ? `${timeDisplay(currentTime, false)} / ${timeDisplay(endTime, false)}`
      : "no video loaded"}
  </div>
  <div id="subtitle-offset-container">
    <p style="width: 10%;">{subtitleOffsetSign}</p>
    <input
      id="subtitle-offset"
      style="width: 90%"
      type="number"
      step="0.05"
      value={subtitleOffset.toFixed(2)}
      on:change={formatSubtitleOffset}
    />
  </div>
</div>

<style>
  * {
    font-size: small;
  }

  #container {
    display: flex;
    flex-direction: column;
  }

  #time-display {
    font-size: large;
  }

  #subtitle-offset-container {
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
