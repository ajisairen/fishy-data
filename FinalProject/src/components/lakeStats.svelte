<script>
    export let selectedLake = null;
  </script>
  
  <style>
    .stats {
      font-family: monospace;
    }
  </style>
  
  <div class="stats">
    {#if selectedLake}
      <h2>{selectedLake.name}</h2>
      <p>Lake stats #TODO.</p>
    {:else}
      <p>Click a lake to see its stats.</p>
    {/if}
  </div>
  