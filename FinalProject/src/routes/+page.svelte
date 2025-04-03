<script>
  import Background from '../components/background.svelte';
  import Introduction from '../components/introduction.svelte';
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
  </style>

<div class = "title_intro">
    <h1 class = "title">Factors that Influence Minnesota Fish Populations</h1>
    <div class = "background-info">
        <Background/>
    </div>
    <div class = "intro">
        <Introduction/>
    </div>
</div>
