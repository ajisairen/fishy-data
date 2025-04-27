<script lang="ts">
    import { text } from "@sveltejs/kit";
    import * as d3 from "d3";
    import { stringify } from "postcss";
    import { onMount } from "svelte";
    export let rawData: Record<number, Record<string, number>>;
    export let focusedSpecies: string = "";
    export let height = 500;
    export let useLogScale = true;
    export let isAvg = false;
    export let setSelectedPoint;

    let container: HTMLElement;
    let width = 800;

    const fishImages: Record<string, string> = {
        "white sucker": "/images/white_sucker.png",
        walleye: "/images/walleye.png",
        pumpkinseed: "/images/pumpkinseed.png",
        bluegill: "/images/bluegill.png",
        "largemouth bass": "/images/largemouth_bass.png",
        "yellow perch": "/images/yellow_perch.png",
        "rock bass": "/images/rock_bass.png",
        "tullibee (cisco)": "/images/tullibee_cisco.png",
        "brown bullhead": "/images/brown_bullhead.png",
        "northern pike": "/images/northern_pike.png",
        "black crappie": "/images/black_crappie.png",
        "yellow bullhead": "/images/yellow_bullhead.png",
        burbot: "/images/burbot.png",
        "shorthead redhorse": "/images/shorthead_redhorse.png",
    };

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
            Object.keys(rawData[year]).forEach((species) =>
                allSpecies.add(species),
            );
        });
    }

    let allSpecies: Set<string>;

    $: data = Array.from(allSpecies).map((species) => {
        return {
            species,
            values: years.filter((year) => rawData[year]?.[species] !== undefined) // filter out years with no data
                .map((year) => ({
                    year,
                    count: rawData[year]?.[species] ?? 0,
                })),
        };
    }).sort((a, b) => {
        // Sort species by lastValue.count (i.e., the last year's count)
        const aLastValue = a.values[a.values.length - 1]?.count || 0;
        const bLastValue = b.values[b.values.length - 1]?.count || 0;
        return aLastValue - bLastValue; // Sort in descending order
    });

    $: xScale = d3
        .scaleLinear()
        .domain(d3.extent(years) as [number, number])
        .range([0, innerWidth]);

    // Handle log scale properly
    $: yMin = useLogScale
        ? Math.max(
              1,
              d3.min(data, (d) =>
                  d3.min(d.values, (v) => Math.max(v.count, 1)),
              ) || 1,
          )
        : 0;

    $: yMax = d3.max(data, (d) => d3.max(d.values, (v) => v.count)) || 10;

    // Choose scale based on toggle
    $: yScale = useLogScale
        ? d3.scaleLog().domain([yMin, yMax]).range([innerHeight, 0])
        : d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

    const customColors = [
        "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#ffff4f"
    ];

    $: color = d3.scaleOrdinal(customColors).domain([...allSpecies]);

    // Modify line generator to handle log scale
    $: line = d3
        .line<{ year: number; count: number }>()
        .x((d) => xScale(d.year))
        .y((d) => {
            // For log scale, ensure we never try to plot a zero value
            const value = useLogScale ? Math.max(d.count, yMin) : d.count;
            return yScale(value);
        })
        .defined((d) => {
            // Skip drawing line segments for zero values when using log scale
            return !useLogScale || d.count > 0;
        })
        .curve(d3.curveMonotoneX);

    $: lines = data.map((series) => ({
        species: series.species,
        path: line(series.values),
        color: color(series.species),
        lastValue: series.values[series.values.length - 1],
        highlighted: series.species === focusedSpecies,
    }));

    // Generate appropriate ticks
    $: xTicks = xScale.ticks(10);

    // Generate appropriate y-axis ticks based on scale type
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

    // calculate major dips
    const dipThresh = 0.95;
    $: dips = data.map((series) => {
        const speciesDips = [];
        for (let i = 1; i < series.values.length; i++) {
            const prev = series.values[i - 1];
            const curr = series.values[i];
            const drop = (prev.count - curr.count) / prev.count;
            if (drop >= dipThresh) {
                speciesDips.push({
                    year: curr.year,
                    count: curr.count,
                    drop,
                });
            }
        }
        return {
            species: series.species,
            dip: speciesDips,
        };
    });

    const spikeThresh = 2.0;
    $: spikes = data.map((series) => {
        const speciesSpikes = [];
        for (let i = 1; i < series.values.length; i++) {
            const prev = series.values[i - 1];
            const curr = series.values[i];
            const spike = (curr.count - prev.count) / prev.count;
            if (spike >= spikeThresh) {
                speciesSpikes.push({
                    year: curr.year,
                    count: curr.count,
                    spike,
                });
            }
        }
        return {
            species: series.species,
            spike: speciesSpikes,
        };
    });

    // Calculate label positions
    $: labelPositions = (() => {
        // Initialize vars
        const positions: Record<string, number> = {};
        let imagePosition: number[] = [];
        const usedPositions: number[][] = [];
        const imageHeight = 57;
        const imageYOffset = imageHeight / 2;
        const textSize = 10;
        const textOffset = textSize / 2;
        let imageY = 0;

        // Calculate y position of focused species' image label
        const focusedLine = lines.find((l) => l.species === focusedSpecies);
        if (focusedLine) {
            imageY = yScale(Math.max(focusedLine.lastValue.count, useLogScale ? yMin : 0)) - imageYOffset;
            imagePosition = [imageY, imageY + imageHeight];
        }

        // Calculate y position of each label
        for (const { species, lastValue } of lines) {
            let y: number;

            if (species !== focusedSpecies) {
                // Not focused species
                // calculate y position for text label

                // Calculate default label position
                y = yScale(Math.max(lastValue.count, useLogScale ? yMin : 0));

                if (imagePosition.length >= 2 && y >= imagePosition[0] && y <= imagePosition[1]) {
                    // Label is in the position of the image
                    // remove the label
                    y = 999;
                }
                else {
                    // Label not in the position of the image
                    let i = 0;
                    // Find position for the label that does not overlap with other labels
                    while (i < usedPositions.length) {
                        const pos: number[] = usedPositions[i];

                        if (y >= pos[0] - textOffset && y <= pos[1] + textOffset) {
                            // Label is in the top of another label
                            // move up
                            y = pos[0] - textSize;
                            i = 0;
                        } else i++; // Check next used position
                    }
                }
                // Store new used position
                const yTop = y - textOffset;
                const yBottom = y + textOffset;
                usedPositions.push([yTop, yBottom]);
            }
            else {
                // Is focused species
                // set y to position for image label
                y = imageY;
            }

            // Store y position for species
            positions[species] = y;
        }

        return positions;
    })();

    function lightenColor(color: string, val = 1): string {
        const d3Color = d3.color(color);
        // return if color failed to parse
        if (!d3Color) return color;
        return d3Color.brighter(val).toString();
    }

    // Get max year
    $: maxYear = d3.max(years);
</script>

<div bind:this={container} class="w-full max-h-[calc(70vh-8rem)]">
    <svg
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        preserveAspectRatio="xMidYMid meet"
        class="w-full font-sans text-sm max-h-[calc(70vh-4.6rem)]"
    >
        <g transform={`translate(${margin.left},${margin.top})`}>
            <!-- X Axis -->
            <line
                x1="0"
                y1={innerHeight}
                x2={innerWidth}
                y2={innerHeight}
                stroke="white"
            />
            {#each xTicks as tick}
                <line
                    x1={xScale(tick)}
                    y1={innerHeight}
                    x2={xScale(tick)}
                    y2={innerHeight + 6}
                    stroke="white"
                />
                <!-- svelte-ignore component_name_lowercase -->
                <text
                    x={xScale(tick)}
                    y={innerHeight + 20}
                    text-anchor="middle"
                >
                    {tick}
                </text>
            {/each}

            <!-- Y Axis -->
            <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="white" />
            {#each yTicks as tick}
                <line
                    x1="-6"
                    y1={yScale(tick)}
                    x2="0"
                    y2={yScale(tick)}
                    stroke="white"
                />
                <!-- svelte-ignore component_name_lowercase -->
                <text
                    x="-10"
                    y={yScale(tick)}
                    text-anchor="end"
                    alignment-baseline="middle"
                >
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
                    stroke-width={highlighted || species === focusedSpecies
                        ? 3
                        : 1.5}
                    opacity={highlighted ||
                    species === focusedSpecies ||
                    !focusedSpecies
                        ? 1
                        : 0.2}
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
            {#each lines as { species, color, highlighted }}
                {#if species !== focusedSpecies}
                    <!-- svelte-ignore component_name_lowercase -->
                    <text
                        x={xScale(maxYear) + 5}
                        y={labelPositions[species]}
                        style="fill: {lightenColor(color, 1)};"
                        alignment-baseline="middle"
                        font-weight={highlighted || species === focusedSpecies
                            ? "bold"
                            : "normal"}
                        font-size={"12px"}
                    >
                        {species}
                    </text>
                {/if}
                <!-- add fish images based on focused species -->
                {#if fishImages[species] && species === focusedSpecies}
                    <image
                        class="relative absolute z-10"
                        href={fishImages[species]}
                        x={xScale(maxYear) + 5}
                        y={labelPositions[species]}
                        width="100"
                        height="57"
                    />
                {/if}
            {/each}

            <!-- svelte-ignore component_name_lowercase -->
            <text
                x={innerWidth / 2}
                y={innerHeight + 36}
                text-anchor="middle"
                font-weight="bold"
            >
                Year
            </text>

            <!-- svelte-ignore component_name_lowercase -->
            <text
                transform={`translate(-45, ${innerHeight / 2}) rotate(-90)`}
                text-anchor="middle"
                font-weight="bold"
            >
                Survey Population Count
            </text>

            {#if isAvg}
                <circle
                    cx={xScale(2007)}
                    cy={yScale(rawData["2007"]["Weighted Average"])}
                    r={7}
                    fill="rgb(249, 148, 86)"
                    class="cursor-pointer"
                    onclick={() => setSelectedPoint(2007)}
                    style="z-index: 100;"
                />
                <circle
                    cx={xScale(2020)}
                    cy={yScale(rawData["2020"]["Weighted Average"])}
                    r={7}
                    fill="rgb(249, 148, 86)"
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
