<script lang="ts">
  export function saveSubtitle(sub: string) {
    savedSubtitles.add(sub);
    savedSubtitles = savedSubtitles; // to notify svelte of the update
  }

  let savedSubtitles = new Set<String>();
</script>

<div>
  <h3>Saved Subtitles</h3>
  <ul id="subtitle-list">
    {#each Array.from(savedSubtitles) as sub}
      <li>{sub}</li>
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
    color: cornflowerblue;
    margin: 10px 0;
  }

  li:focus {
    color: greenyellow;
  }
</style>
