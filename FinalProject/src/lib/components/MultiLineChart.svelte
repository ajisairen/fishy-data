<script lang="ts">
  import * as d3 from 'd3';
  import { stringify } from 'postcss';
  import { onMount } from 'svelte';
  export let rawData: Record<number, Record<string, number>>;
  export let focusedSpecies: string = "";
  export let height = 500;
  export let useLogScale = true;
  
  let container: HTMLElement;
  let width = 800;
  
  const fishImages: Record<string, string> = {
    "white sucker":"/images/white_sucker.png",
    "walleye": "/images/walleye.png",
    "pumpkinseed": "/images/pumpkinseed.png",
    "bluegill": "/images/bluegill.png",
    "largemouth bass": "/images/largemouth_bass.png",
    "yellow perch": "/images/yellow_perch.png",
    "rock bass": "/images/rock_bass.png",
    "tullibee (cisco)": "/images/tullibee_cisco.png",
    "brown bullhead": "/images/brown_bullhead.png",
    "northern pike": "/images/northern_pike.png",
    "black crappie": "/images/black_crappie.png",
    "yellow bullhead": "/images/yellow_bullhead.png",
    "burbot": "/images/burbot.png",
    "shorthead redhorse": "/images/shorthead_redhorse.png"
  }

  function updateWidth() {
    if (container) {
      width = container.clientWidth;
    }
  }
  
  onMount(() => {
    updateWidth();
    
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  });

  $: margin = { top: 20, right: 120, bottom: 40, left: 60 };
  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;
  
  $: years = Object.keys(rawData)
    .map(Number)
    .sort((a, b) => a - b);
    
  $: {
    allSpecies = new Set<string>();
    years.forEach((year) => {
      Object.keys(rawData[year]).forEach((species) => allSpecies.add(species));
    });
  }
  
  let allSpecies: Set<string>;
  
  $: data = Array.from(allSpecies).map((species) => {
    return {
      species,
      values: years.map((year) => ({
        year,
        count: rawData[year]?.[species] ?? 0
      }))
    };
  });
  
  $: xScale = d3
    .scaleLinear()
    .domain(d3.extent(years) as [number, number])
    .range([0, innerWidth]);
  
  // Handle log scale properly
  $: yMin = useLogScale 
    ? Math.max(1, d3.min(data, d => d3.min(d.values, v => Math.max(v.count, 1))) || 1)
    : 0;
  
  $: yMax = d3.max(data, d => d3.max(d.values, v => v.count)) || 10;
  
  // Choose scale based on toggle
  $: yScale = useLogScale
    ? d3.scaleLog()
      .domain([yMin, yMax])
      .range([innerHeight, 0])
    : d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
  
  $: color = d3.scaleOrdinal(d3.schemeTableau10).domain([...allSpecies]);
  
  // Modify line generator to handle log scale
  $: line = d3
    .line<{ year: number; count: number }>()
    .x(d => xScale(d.year))
    .y(d => {
      // For log scale, ensure we never try to plot a zero value
      const value = useLogScale 
        ? Math.max(d.count, yMin) 
        : d.count;
      return yScale(value);
    })
    .defined(d => {
      // Skip drawing line segments for zero values when using log scale
      return !useLogScale || d.count > 0;
    })
    .curve(d3.curveMonotoneX);
  
  $: lines = data.map((series) => ({
    species: series.species,
    path: line(series.values),
    color: color(series.species),
    lastValue: series.values[series.values.length - 1],
    highlighted: series.species === focusedSpecies
  }));
  
  // Generate appropriate ticks
  $: xTicks = xScale.ticks(10);
  
  // Generate appropriate y-axis ticks based on scale type
  $: yTicks = useLogScale 
    ? yScale.ticks(4).filter(t => t > 0) 
    : yScale.ticks(5);
    
  // Format tick labels
  function formatTickLabel(value: number): string {
    if (useLogScale) {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    }
    return value.toString();
  }

  // calculate major dips
  const dipThresh = 0.95;
  $: dips = data.map((series) => {
    const speciesDips = [];
    for (let i = 1; i < series.values.length; i++){
      const prev = series.values[i-1];
      const curr = series.values[i];
      const drop = (prev.count - curr.count) / prev.count;
      if (drop >= dipThresh) {
        speciesDips.push({
          year: curr.year,
          count: curr.count,
          drop,
        })
      }
    } return {
      species: series.species,
      dip: speciesDips,
    }
  })
  // calculate major spikes
  const spikeThresh = 2.0;
  $: spikes = data.map((series) => {
    const speciesSpikes = [];
    for (let i = 1; i < series.values.length; i++) {
      const prev = series.values[i-1];
      const curr = series.values[i];
      const spike = (curr.count - prev.count) / prev.count;
      if (spike >= spikeThresh) {
        speciesSpikes.push({
          year: curr.year,
          count: curr.count,
          spike,
        })
      }
    } return {
      species: series.species,
      spike: speciesSpikes,
    }
  })
</script>

<div bind:this={container} class="w-full">
  <svg 
    {width} 
    {height} 
    viewBox="0 0 {width} {height}" 
    preserveAspectRatio="xMidYMid meet"
    class="w-full font-sans text-sm"
  >
    <g transform={`translate(${margin.left},${margin.top})`}>
      <!-- X Axis -->
      <line x1="0" y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="black" />
      {#each xTicks as tick}
        <line
          x1={xScale(tick)}
          y1={innerHeight}
          x2={xScale(tick)}
          y2={innerHeight + 6}
          stroke="black"
        />
        <text x={xScale(tick)} y={innerHeight + 20} text-anchor="middle">
          {tick}
        </text>
      {/each}
      
      <!-- Y Axis -->
      <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="black" />
      {#each yTicks as tick}
        <line x1="-6" y1={yScale(tick)} x2="0" y2={yScale(tick)} stroke="black" />
        <text x="-10" y={yScale(tick)} text-anchor="end" alignment-baseline="middle">
          {formatTickLabel(tick)}
        </text>
      {/each}
      
      <!-- Grid lines for better readability -->
      {#each yTicks as tick}
        <line 
          x1="0" 
          y1={yScale(tick)} 
          x2={innerWidth} 
          y2={yScale(tick)} 
          stroke="#e5e5e5" 
          stroke-dasharray="2,2" 
        />
      {/each}
      
      <!-- Lines -->
      {#each lines as { species, path, color, highlighted, lastValue }}
        <path 
          d={path} 
          fill="none" 
          stroke={color} 
          stroke-width={highlighted || species === focusedSpecies ? 3 : 1.5}
          opacity={highlighted || species === focusedSpecies || !focusedSpecies ? 1 : 0.2}
        />
      {/each}
      <!-- points added for changes? might just want to change later -->
      <!-- {#each dips as { species, dip }}
        {#if species === focusedSpecies}
          {#each dip as { year, count }}
            {#if count > 0}
              <circle 
                  cx={xScale(year)}
                  cy={yScale(Math.max(count, useLogScale ? yMin : 0))}
                  r="5"
                  fill={color(species)}
                  stroke={d3.color(color(species))?.darker(1).toString()}
                  stroke-width={2}
              />
            {/if}
          {/each}
        {/if}
      {/each}
      {#each spikes as { species, spike}}
        {#if species === focusedSpecies}
          {#each spike as {year, count}}
          <circle 
          cx={xScale(year)}
          cy={yScale(Math.max(count, useLogScale ? yMin : 0))}
          r="5"
          fill={color(species)}
          stroke={d3.color(color(species))?.darker(1).toString()}
          stroke-width={2}
          />
          {/each}
        {/if}
      {/each} -->

      <!-- Labels at end of line -->
      {#each lines as { species, color, lastValue, highlighted }}
      {#if species !== focusedSpecies}
        <text
          x={xScale(lastValue.year) + 5}
          y={yScale(Math.max(lastValue.count, useLogScale ? yMin : 0))}
          fill={color}
          alignment-baseline="middle"
          font-weight={highlighted || species === focusedSpecies ? "bold" : "normal"}
          font-size={highlighted || species === focusedSpecies ? "12px" : "10px"}
        >
          {species}
        </text>
      {/if}
      <!-- add fish images based on focused species -->
      {#if fishImages[species] && species === focusedSpecies}
        <image
          class="relative absolute z-10"
          href={fishImages[species]}
          x={xScale(lastValue.year) + 5}
          y={yScale(Math.max(lastValue.count, useLogScale ? yMin : 0)) - 70}
          width="100"
          height="140"
        />
      {/if}
    {/each}
    </g>
  </svg>
</div>

<style>
  svg {
    display: block;
    max-width: 100%;
    height: auto;
  }
  
</style>
