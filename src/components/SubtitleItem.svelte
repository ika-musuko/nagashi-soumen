<script lang="ts">
  import { timeDisplay } from "../utils/utils";

  export let time: number;
  export let text: string;
  export let color: string = "inherit";
</script>

<div>
  <span class="time"> {timeDisplay(time)}&nbsp; </span>
  <span class="text" style="--text-color: {color}">{text}</span>
</div>

<style>
  .time {
    user-select: none;
    font-size: small;
  }

  .text {
    color: var(--text-color, inherit);
  }
</style>
