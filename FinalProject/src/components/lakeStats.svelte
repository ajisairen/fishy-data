<script>
  import { onMount } from 'svelte';
  import FishSurveyChart from './FishSurveyChart.svelte';
  import SpeciesBreakdownChart from './SpeciesBreakdownChart.svelte';

  export let selectedLake = null;
  export let selectedYear = null;
  export let fishSurveyData = [];

  let lakeData = [];
  let hoveredYear = null;

  $: if (selectedLake && fishSurveyData.length > 0) {
    lakeData = fishSurveyData.filter(d => d.lake.toLowerCase() === selectedLake.name.toLowerCase());
  }

  $: pieData = selectedYear
    ? lakeData.filter(d => d.year === selectedYear)
    : hoveredYear
      ? lakeData.filter(d => d.year === hoveredYear)
      : lakeData;

  $: sampledYears = [...new Set(lakeData.map(d => d.year))].sort((a, b) => a - b);

  const lakeInfo = {
    "Cass": { description: "Cass Lake is located in Cass County, MN. It is a 15,596 acre lake with a max depth of 120 feet. It has clearer than usual water due to zerba mussels which are an invasive species."},
    "Kabetogama": { description: "Kabetogama Lake is located in St. Louis County, MN. It is a 24,034 acre lake with a max depth of 80 feet. Kabetogama contains a population of Saugers as it is connected to a river where they can spawn."},
    "Lake of the Woods": { description: "TODO"},
    "Leech": { description: "TODO"},
    "Mille Lacs": { description: "TODO"},
    "Vermilion": { description: "TODO" },
    "Minnetonka": { description: "TODO"},
    "Winnibigoshish": { description: "TODO"},
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

  .lake-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem;
    border-bottom: 1px solid #888;
  }

  .text-stats {
    flex: 1;
  }

  .species-chart-top {
    max-width: 300px;
    margin-left: 2rem;
  }

  .graph-stats {
    flex: 2;
    display: flex;
    flex-direction: row;
    padding: 1rem;
    gap: 2rem;
  }

  .main-chart {
    flex: 1;
  }
</style>

<div class="lake-stats">
  {#if selectedLake}
    <div class="lake-header">
      <div class="text-stats">
        <h2>{selectedLake.name}</h2>
        {#if lakeInfo[selectedLake.name]}
          <div class="lake-description">
            <p><strong>Overview:</strong> {lakeInfo[selectedLake.name].description}</p>
            <!-- <p><strong>Fun Fact:</strong> {lakeInfo[selectedLake.name].funFact}</p>
            <p><strong>Management Notes:</strong> {lakeInfo[selectedLake.name].managementNotes}</p> -->
          </div>
        {:else}
          <p>No description available for this lake yet.</p>
        {/if}
      </div>

      {#if lakeData.length > 0}
        <div class="species-chart-top">
          <SpeciesBreakdownChart lakeData={pieData} {selectedYear} />
        </div>
      {/if}
    </div>
  {:else}
    <p style="padding: 1rem;">Click a lake to see its stats.</p>
  {/if}

  {#if selectedLake && lakeData.length > 0}
    <div class="graph-stats">
      <div class="main-chart">
        <FishSurveyChart
          {lakeData}
          {hoveredYear}
          {selectedYear}
          onSelectedYearChange={(val) => selectedYear = val}
          onHoveredYearChange={(val) => hoveredYear = val}
        />
      </div>
    </div>
  {:else if selectedLake}
    <p style="padding: 1rem;">No survey data available.</p>
  {/if}
</div>
