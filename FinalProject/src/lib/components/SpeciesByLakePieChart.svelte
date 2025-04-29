<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import speciesToLake from "$lib/speciesToLake.json";

    export let lake: string;
    export let width: number;
    export let species: string;

    let container: HTMLDivElement;
    let svg;

    let nonce = -1;

    $: data = Object.keys(speciesToLake)
        .map((species) => {
            nonce++;
            return {
                idx: nonce,
                name: species,
                value: speciesToLake[species][lake],
            };
        })
        .filter((item) => item.value !== undefined);

    const hPadding = 50;
    const vPadding = 50;
    $: height = Math.min(width - hPadding, 500);
    $: radius = Math.min(width - hPadding, height - vPadding) / 2;

    $: arc = d3
        .arc()
        .innerRadius(radius * 0.25)
        .outerRadius(radius - 1);

    $: pie = d3
        .pie()
        .padAngle(1 / radius)
        .sort(null)
        .value((d) => d.value);

    $: color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.name))
        .range(
            d3
                .quantize(
                    (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
                    data.length,
                )
                .reverse(),
        );
    
    function createPieChart() {
        // Return if container does not exist
        if (!container) return;

        // Remove previous SVG
        d3.select(container).selectAll("*").remove();

        svg = d3
            .select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        // console.log(color("walleye"))
        svg.append("g")
            .selectAll()
            .data(pie(data))
            .join("path")
            .attr("opacity", (d) => d.data.name===species ? 1 : 0.25)
            .attr("fill", (d) => color(d.data.name))
            .attr("stroke", "#fff")
            .attr("stroke-width", "1")
            .attr("d", arc)
            .append("title")
            .text((d) => `${d.data.name}: ${d.data.value}`);
    }

    onMount(() => {
        createPieChart();
    });

    // Create a new pie chart if data, species, or container change
    $: if (data && species && container) {
        createPieChart();
    }
</script>

<div class="flex justify-center items-center w-full">
    <div class="flex flex-row items-center gap-4">
        <div bind:this={container} class="flex justify-center items-center">
            <!-- The pie chart will go here -->
        </div>
        <div class="flex flex-col gap-2">
        {#each data as item }
            <div class="flex items-center gap-x-2">
                <div class="w-[12px] h-[12px]" style={`background-color: ${color(item.name)};`}></div>
                <p class="text-sm {item.name===species ? 'font-bold text-lg' : 'font-light'}">{item.name}</p>
            </div>
        {/each}
        </div>
    </div>
</div>
  

