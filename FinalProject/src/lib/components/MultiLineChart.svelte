<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  
  export let rawData: Record<number, Record<string, number>>;
  export let focusedSpecies: string = "";
  export let height = 500;
  export let useLogScale = true;
  export let isAvg = false;
  export let setSelectedPoint;
  
  let container: HTMLElement;
  let width = 800;
  
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
  
  $: yScale = useLogScale
    ? d3.scaleLog()
      .domain([yMin, yMax])
      .range([innerHeight, 0])
    : d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
  
  $: color = d3.scaleOrdinal(d3.schemeTableau10).domain([...allSpecies]);
  
  $: line = d3
    .line<{ year: number; count: number }>()
    .x(d => xScale(d.year))
    .y(d => {
      const value = useLogScale 
        ? Math.max(d.count, yMin) 
        : d.count;
      return yScale(value);
    })
    .defined(d => {
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
  
  $: xTicks = xScale.ticks(10);
  
  $: yTicks = useLogScale 
    ? yScale.ticks(4).filter((t: any) => t > 0) 
    : yScale.ticks(5);
    
  // Format tick labels
  function formatTickLabel(value: number): string {
    if (useLogScale) {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    }
    return value.toString();
  }
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
      
      <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="black" />
      {#each yTicks as tick}
        <line x1="-6" y1={yScale(tick)} x2="0" y2={yScale(tick)} stroke="black" />
        <text x="-10" y={yScale(tick)} text-anchor="end" alignment-baseline="middle">
          {formatTickLabel(tick)}
        </text>
      {/each}
      
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
      
      {#each lines as { species, path, color, highlighted }}
        <path 
          d={path} 
          fill="none" 
          stroke={color} 
          stroke-width={highlighted || species === focusedSpecies ? 3 : 1.5}
          opacity={highlighted || species === focusedSpecies || !focusedSpecies ? 1 : 0.2}
        />
      {/each}
      
      {#each lines as { species, color, lastValue, highlighted }}
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
      {/each}

    <text 
      x={innerWidth / 2} 
      y={innerHeight + 36} 
      text-anchor="middle"
      font-weight="bold"
    >
      Year
    </text>

    <text 
      transform={`translate(-45, ${innerHeight / 2}) rotate(-90)`} 
      text-anchor="middle"
      font-weight="bold"
    >
      Survey Population Count
    </text>

    {#if isAvg}
        <circle cx={xScale(2007)} cy={yScale(rawData["2007"]["Weighted Average"])} 
            r={7} fill="steelblue" 
            class="cursor-pointer"
            onclick={() => setSelectedPoint(2007)}
            style="z-index: 100;"
        />
        <circle cx={xScale(2020)} cy={yScale(rawData["2020"]["Weighted Average"])} 
            r={7} fill="steelblue"
            class="cursor-pointer"
            onclick={() => setSelectedPoint(2020)}
            style="z-index: 100;"
        />
    {/if}

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
