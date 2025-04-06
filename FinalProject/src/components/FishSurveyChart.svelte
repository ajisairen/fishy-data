

<script>
    import { onMount } from 'svelte';
    import { tick } from 'svelte';
    import Chart from 'chart.js/auto';
  
    export let lakeData = [];
  
    let canvasEl;
    let chart;
  
    $: yearlyCounts = lakeData.reduce((acc, { year, count }) => {
      acc[year] = (acc[year] || 0) + count;
      return acc;
    }, {});
  
    $: labels = Object.keys(yearlyCounts).sort((a, b) => +a - +b);
    $: values = labels.map(year => yearlyCounts[year]);
  
    $: if (canvasEl && lakeData.length > 0) {
      drawChart();
    }
  
    async function drawChart() {
      await tick();
  
      if (chart) {
        chart.destroy();
      }
  
      chart = new Chart(canvasEl, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Total Fish Count',
            data: values,
            borderColor: 'aqua',
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: 'white' }},
            title: {
              display: true,
              text: 'Total Fish Population Over Time',
              color: 'white'
            },
            tooltip: {
              backgroundColor: '#333',
              titleColor: '#fff',
              bodyColor: '#fff'
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Year', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
              title: { display: true, text: 'Count', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255,255,255,0.1)' }
            }
          }
        }
      });
    }
  </script>
  
  <canvas bind:this={canvasEl}></canvas>
  
  <style>
    canvas {
      width: 100%;
      height: 100%;
    }
  </style>
  