<script>
    import { onMount } from 'svelte';
    import { tick } from 'svelte';
    import Chart from 'chart.js/auto';
  
    export let lakeData = [];
    export let selectedYear = null;
  
    let canvasEl;
    let chart;
  
    $: speciesTotals = lakeData.reduce((acc, d) => {
      acc[d.species] = (acc[d.species] || 0) + d.count;
      return acc;
    }, {});
  
    $: speciesLabels = Object.keys(speciesTotals);
    $: speciesCounts = speciesLabels.map(species => speciesTotals[species]);
  
    $: if (canvasEl && lakeData.length > 0) {
      drawChart();
    }
  
    async function drawChart() {
      await tick();
      if (chart) chart.destroy();
  
      chart = new Chart(canvasEl, {
        type: 'doughnut',
        data: {
          labels: speciesLabels,
          datasets: [{
            data: speciesCounts,
            backgroundColor: speciesLabels.map(species => hashColor(species)),
            borderColor: 'white',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: 'white' }
            },
            title: {
              display: true,
              text: 'Species Breakdown',
              color: 'white',
              align: 'start',
              padding: {
                top: 10,
                bottom: 10
              }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  const count = ctx.parsed;
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const percent = ((count / total) * 100).toFixed(1);
                  return `${ctx.label}: ${count} (${percent}%)`;
                }
              }
            }
          }
        }
      });
    }

    function hashColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
  </script>
  
  <canvas bind:this={canvasEl}></canvas>
  
  <p style="text-align: center; margin-top: 0.5rem;">
    Showing: <strong>{selectedYear ?? 'All Years'}</strong>
  </p>
  
  <style>
    canvas {
      width: 100%;
      max-width: 300px;
      height: auto;
    }
  
    p {
      color: white;
      font-family: monospace;
      font-size: 0.9rem;
    }
  </style>
  