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

        svg.append("g")
            .selectAll()
            .data(pie(data))
            .join("path")
            .attr("opacity", (d) => d.data.name===species ? 1 : 0.25)
            .attr("fill", (d) => color(d.data.name))
            .attr("d", arc)
            .append("title")
            .text((d) => `${d.data.name}: ${d.data.value}`);

        var getAngle = function (d) {
            return ((180 / Math.PI) * (d.startAngle + d.endAngle)) / 2 - 90;
        };

        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "middle")
            .selectAll()
            .data(pie(data))
            .join("text")
            .attr("transform", (d) => {
                if (d.data.idx % 2 == 0) {
                    var c = arc.centroid(d),
                        x = c[0],
                        y = c[1],
                        h = Math.sqrt(x * x + y * y);
                    return (
                        "translate(" +
                        (x / h) * radius +
                        "," +
                        (y / h) * radius +
                        ") rotate(15)"
                    );
                } else {
                    return `translate(${arc.centroid(d)}) rotate(15)`;
                }
            })
            // .style("fill", "black")
            .call((text) =>
                text
                    .append("tspan")
                    .attr("y", "-0.4em")
                    .attr("font-weight", "bold")
                    .text((d) => d.data.name),
            )
            .call((text) =>
                text
                    .filter((d) => d.endAngle - d.startAngle > 0.25)
                    .append("tspan")
                    .attr("x", 0)
                    .attr("y", "0.7em")
                    .attr("fill-opacity", 0.7)
                    .text((d) => d.data.value),
            );

        d3.selectAll(".text-element").style("fill", "black");
    });
</script>

<div class="flex justify-center items-center" bind:this={container}></div>

