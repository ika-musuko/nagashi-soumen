<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay, floatEquals } from "../utils/utils";

  export let currentTime: number;
  export let endTime: number;
  const dispatch = createEventDispatcher();
  function handleSeek(t: number) {
    dispatch("seek", { time: t });
  }

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
        subtitleOffsetSign = "→";
      } else {
        subtitleOffsetSign = "←";
      }
    }
  }

  let subtitleOffsetSign: string = "⏺";

  let seekBar: HTMLInputElement;
</script>

<span id="container">
  <span id="time-display">
    {!isNaN(endTime)
      ? `${timeDisplay(currentTime, false)} / ${timeDisplay(endTime, false)}`
      : "--:-- / --:--"}
  </span>
  <input
    id="seek-bar"
    bind:this={seekBar}
    type="range"
    max={isFinite(endTime) ? endTime : 0}
    value={isFinite(currentTime) ? currentTime : 0}
    on:input={() => {
      handleSeek(parseFloat(seekBar.value));
    }}
  />
  <span id="subtitle-offset-container">
    <span id="subtitle-offset-sign">{subtitleOffsetSign}</span>
    <!--<span id="subtitle-offset-input">0.05</span>-->
    <input
      id="subtitle-offset-input"
      type="number"
      step="0.25"
      value={subtitleOffset.toFixed(2)}
      on:change={formatSubtitleOffset}
    />
  </span>
</span>

<style>
  * {
    font-size: 100%;
  }

  #container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  #time-display {
    padding: 0 5px;
    font-size: 100%;
  }

  #seek-bar {
    flex: 1;
    appearance: none;
    border: none;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }

  #seek-bar:focus {
    outline: none;
  }

  #subtitle-offset-container {
    flex-basis: 7%;

    display: flex;
    flex-direction: row;
    align-items: center;
  }

  #subtitle-offset-sign {
    flex-basis: 10%;
  }

  #subtitle-offset-input {
    width: 70%;
    background-color: inherit;
    text-align: center;
    border: none;
    appearance: textfield;
  }

  #subtitle-offset-input:focus {
    outline: none;
  }

  #subtitle-offset-input::-webkit-outer-spin-button,
  #subtitle-offset-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
