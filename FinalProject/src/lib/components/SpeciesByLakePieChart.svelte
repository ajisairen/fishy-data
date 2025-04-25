<script>
    import * as d3 from "d3";
    import speciesToLake from "$lib/speciesToLake.json";

    export let lake;
    export let width;
    export let species;

    let nonce = -1;
    const data = Object.keys(speciesToLake)
        .map((species) => {
            nonce++;
            return {
                idx: nonce,
                name: species,
                value: speciesToLake[species][lake],
            };
        })
        .filter((item) => item.value !== undefined);
    console.log(data);

    const hPadding = 50;
    const vPadding = 50;
    const height = Math.min(width - hPadding, 500);
    const radius = Math.min(width - hPadding, height - vPadding) / 2;

    const arc = d3
        .arc()
        .innerRadius(radius * 0.25)
        .outerRadius(radius - 1);

    const pie = d3
        .pie()
        .padAngle(1 / radius)
        .sort(null)
        .value((d) => d.value);

    const color = d3
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

    let container;

    import { onMount } from "svelte";

    onMount(() => {
        const svg = d3
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
    });
</script>

<div class="relative flex justify-center items-center" bind:this={container}>
    <div class="absolute -translate-y-1/2 -left-2/5 top-1/2 rounded-lg px-2 py-1 flex flex-col w-fit">
        {#each data as item }
            <div class="flex items-center gap-x-2">
                <div class="w-[10px] h-[10px]" style={`background-color: ${color(item.name)};`}>
                </div>
                <p class="text-sm {item.name===species ? 'font-bold text-lg' : 'font-light'}">{item.name}</p>
            </div>
        {/each}
    </div>
</div>

