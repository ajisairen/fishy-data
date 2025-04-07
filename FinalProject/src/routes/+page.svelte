<script>
  import * as d3 from 'd3';
  import { onMount } from "svelte";
  import Background from '../components/background.svelte';
  import Introduction from '../components/introduction.svelte';
  import MinnesotaMap from '../components/minnesotaMap.svelte';
  import LakeStats from '../components/lakeStats.svelte';
  let selectedLake;
  let fishSurveyData = [];

  onMount(async () => {
    const data = await d3.csv('/fish_survey_clean.csv', row => ({
      lake: row["Lake_Name"].trim(),
      year: +row["Year"],
      species: row["Species"].trim(),
      count: +row["Total"]
    }));

    fishSurveyData = data;

    console.log("Parsed Survey Data:", fishSurveyData.slice(0, 5));
  });

</script>

<style>
    :global(html), :global(body) {
        background-color: rgb(56, 56, 56);
    }
    .title_intro {
      text-align: center;
        color: white;
        font-family: monospace;
    }
    .title {
        text-shadow:
            -1px -1px 0 black,
            1px -1px 0 black,
            -1px  1px 0 black,
            1px  1px 0 black;
    }
    .background-info {
        font-size: large;
    }
    .intro {
        font-size: large;
    }
    .map-box {
    margin: 2rem auto;
    width: 95%;
    height: 1000px;
    border: 2px solid white;
    display: flex;
    color: white;
  }
  .map-half {
    flex: 1;
    position: relative;
  }
  .stats-half {
    flex: 1;
    padding: 1rem;
    background-color: rgba(255,255,255,0.1);
  }
  </style>

<div class="title_intro">
    <h1 class="title">Factors that Influence Minnesota Fish Populations</h1>
    <div class="background-info"><Background/></div>
    <div class="intro">
      <h2>So What Factors Influence these Fish Populations?</h2>
      <h4>To find the answer to this question we will look at 8 of the biggest lakes in Minnesota and their fish populations. These lakes are:</h4>
      <p>- Cass</p>
      <p>- Kabetogama</p>
      <p>- Lake of the Woods</p>
      <p>- Leech</p>
      <p>- Mille Lacs</p>
      <p>- Minnetonka</p>
      <p>- Vermilion</p>
      <p>- Winnibigoshish</p>
      <h4>The factors we will look at are:</h4>
      <p>- Climate</p>
      <p>- Fish Stocking</p>
      <p>- Fishing Pressure</p>
      <p>- Invasive Species</p>
      <p>- Predation</p>
      <h4>These are not all the factors that can effect fish populations but these are possible strong signals and there is data available to analyze these factors. By the end of this study we should hopefully find out one or two factors that strongly influence fish populations.</h4>
      <h2>Fish Population Overview</h2>
      <p>Before we get started looking at the factors, please get familar with the population data from each lake using the visualization below.</p>
    </div>
    <div class="map-box">
        <div class="map-half">
          <MinnesotaMap bind:selectedLake />
        </div>
        <div class="stats-half">
          <LakeStats {selectedLake} {fishSurveyData} />
        </div>
      </div>
</div>
