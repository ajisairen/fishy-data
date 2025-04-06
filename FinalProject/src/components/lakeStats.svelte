<script>
  import { onMount } from 'svelte';
  import FishSurveyChart from './FishSurveyChart.svelte';

  export let selectedLake = null;
  export let fishSurveyData = [];

  let lakeData = [];

  $: if (selectedLake && fishSurveyData.length > 0) {
    lakeData = fishSurveyData.filter(d => d.lake.toLowerCase() === selectedLake.name.toLowerCase());
    console.log("Selected Lake:", selectedLake.name);
    console.log("Matching Entries:", lakeData.length);
    console.log("First Match:", lakeData[0]);

  }
  const lakeInfo = {
    "Cass": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
    "Kabetogama": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
    "Lake of the Woods": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
    "Leech": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
    "Mille Lacs": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
    "Vermilion": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
    "Minnetonka": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
    "Winnibigoshish": {
      description: "TODO",
      funFact: "TODO",
      managementNotes: "TODO"
    },
  };
</script>

<style>
  .lake-stats {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: monospace;
    color: white;
  }

  .text-stats {
    flex: 1;
    padding: 1rem;
    border-bottom: 1px solid #888;
  }

  .graph-stats {
    flex: 1;
    padding: 1rem;
  }
</style>

<div class="lake-stats">
  <div class="text-stats">
    {#if selectedLake}
      <h2>{selectedLake.name}</h2>
      {#if lakeInfo[selectedLake.name]}
        <div class="lake-description">
          <p><strong>Overview:</strong> {lakeInfo[selectedLake.name].description}</p>
          <p><strong>Fun Fact:</strong> {lakeInfo[selectedLake.name].funFact}</p>
          <p><strong>Management Notes:</strong> {lakeInfo[selectedLake.name].managementNotes}</p>
        </div>
      {:else}
        <p>No description available for this lake yet.</p>
      {/if}
    {:else}
      <p>Click a lake to see its stats.</p>
    {/if}
  </div>

  <div class="graph-stats">
    {#if selectedLake && lakeData.length > 0}
      <FishSurveyChart {lakeData} />
    {:else if selectedLake}
      <p>No survey data available.</p>
    {/if}
  </div>
</div>
