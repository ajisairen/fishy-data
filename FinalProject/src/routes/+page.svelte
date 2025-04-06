<script>
  import Background from '../components/background.svelte';
  import Introduction from '../components/introduction.svelte';
  import MinnesotaMap from '../components/minnesotaMap.svelte';
  import LakeStats from '../components/lakeStats.svelte';
  let selectedLake;
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
    <div class="intro"><Introduction/></div>
  
    <div class="map-box">
        <div class="map-half">
          <MinnesotaMap bind:selectedLake />
        </div>
        <div class="stats-half">
          <LakeStats {selectedLake} />
        </div>
      </div>
</div>
