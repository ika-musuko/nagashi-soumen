<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timeDisplay } from "../utils/utils";
  export let startTime: number;
  export let text: string;
  export let active: boolean = false;

  const dispatch = createEventDispatcher();
  function handleClick() {
    dispatch("click");
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
  class="subtitle {active ? 'active-subtitle' : 'inactive-subtitle'}"
  tabindex="-1"
  on:click={handleClick}
>
  <span style="user-select: none; font-size: small;">
    {timeDisplay(startTime)}:&nbsp;
  </span>
  <span
    class="subtitle-text {active
      ? 'active-subtitle-text'
      : 'inactive-subtitle-text'}"
  >
    {text}
  </span>
</li>

<style>
  .subtitle {
    cursor: pointer;
    border-radius: 3px;
  }

  .inactive-subtitle:hover {
    background-color: #333333;
  }

  .active-subtitle {
    background-color: #773333;
  }

  .active-subtitle-text {
    font-weight: bold;
  }
</style>
