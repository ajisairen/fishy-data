<script>
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import Chart from 'chart.js/auto';

  export let lakeData = [];
  export let hoveredYear = null;
  export let selectedYear = null;
  export let onSelectedYearChange = () => {};
  export let onHoveredYearChange = () => {};

  let canvasEl;
  let chart;

  $: yearlyCounts = lakeData.reduce((acc, { year, count }) => {
    acc[year] = (acc[year] || 0) + count;
    return acc;
  }, {});

  $: labels = Object.keys(yearlyCounts).sort((a, b) => +a - +b);
  $: values = labels.map(year => yearlyCounts[year]);

  $: if (canvasEl && lakeData.length > 0 && selectedYear !== undefined) {
    drawChart();
  }

  async function drawChart() {
    await tick();

    if (chart) chart.destroy();

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
          pointRadius: labels.map(label => +label === selectedYear ? 7 : 4),
          pointBackgroundColor: labels.map(label => +label === selectedYear ? 'yellow' : 'aqua'),
          pointBorderWidth: labels.map(label => +label === selectedYear ? 2 : 0),
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
        },
        onHover: (event, elements) => {
          if (elements.length > 0 && selectedYear === null) {
            const idx = elements[0].index;
            const year = +labels[idx];
            onHoveredYearChange(year);
          } else if (selectedYear === null) {
            onHoveredYearChange(null);
          }
        },

        onClick: (event, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const year = +labels[idx];
            const newSelection = selectedYear === year ? null : year;
            onSelectedYearChange(newSelection);
            onHoveredYearChange(newSelection);
          }
          chart.update();
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
