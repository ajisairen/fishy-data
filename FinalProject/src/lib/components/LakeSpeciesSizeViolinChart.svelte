<script>
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
    import fishDataByYear from "$lib/fish_size_violin_data.json";

	export let selectedYear = 2023;
    const allYears = Object.keys(fishDataByYear).map(Number).sort((a, b) => a - b);
	const minYear = allYears[0];
	const maxYear = allYears[allYears.length - 1];

	let container;

	let resizeObserver;

	function drawChart(containerWidth, containerHeight) {
		const margin = { top: 10, right: 30, bottom: 30, left: 40 };
		const width = containerWidth - margin.left - margin.right;
		const height = (containerHeight - margin.top - margin.bottom);

		d3.select(container).selectAll("*").remove();

		const svg = d3.select(container)
			.append("svg")
			.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
			.attr("preserveAspectRatio", "xMidYMid meet")
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const yearData = fishDataByYear[selectedYear];
		if (!yearData) return;

		const lakes = Array.from(new Set(yearData.map(d => d.lake)));

		const y = d3.scaleLinear()
			.domain([0, d3.max(yearData, d => d.size) || 50])
			.range([height, 0]);

		svg.append("g").call(d3.axisLeft(y));

		const x = d3.scaleBand()
			.domain(lakes)
			.range([0, width])
			.padding(0.1);

		svg.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(x));

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 2)
            .attr("font-size", "12px")
            .text("Lakes");

        // Y-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -height / 2)
            .attr("y", -margin.left + 12)
            .attr("font-size", "12px")
            .text("Fish Size (Inches)");

		const histogram = d3.histogram()
			.domain(y.domain())
			.thresholds(y.ticks(20))
			.value(d => d);

		const lakeBinsMap = d3.rollup(
			yearData,
			group => histogram(group.map(d => d.size)),
			d => d.lake
		);

		const binData = Array.from(lakeBinsMap, ([key, value]) => ({ key, value }));

        svg.selectAll("violin")
            .data(binData)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${x(d.key)},0)`)
            .each(function (d) {
                const localMax = d3.max(d.value, bin => bin.length) || 1;
                const localXNum = d3.scaleLinear()
                    .domain([-localMax, localMax])
                    .range([0, x.bandwidth()]);

                d3.select(this).append("path")
                    .datum(d.value)
                    .attr("d", d3.area()
                        .x0(bin => localXNum(-bin.length))
                        .x1(bin => localXNum(bin.length))
                        .y(bin => y(bin.x0))
                        .curve(d3.curveCatmullRom))
                    .style("fill", "steelblue")
                    .style("stroke", "none");
            });


		svg.selectAll("violin")
			.data(binData)
			.enter()
			.append("g")
			.attr("transform", d => `translate(${x(d.key)},0)`)
			.append("path")
			.datum(d => d.value)
			.attr("d", d3.area()
				.y(d => y(d.x0))
				.curve(d3.curveCatmullRom))
			.style("fill", "steelblue")
			.style("stroke", "none");
	}

	function resize() {
		if (container) {
			const rect = container.getBoundingClientRect();
			drawChart(rect.width, rect.height);
		}
	}

    $: selectedYear, resize();

	onMount(() => {
		resize();

		resizeObserver = new ResizeObserver(() => {
			resize();
		});
		resizeObserver.observe(container);
	});

	onDestroy(() => {
		if (resizeObserver && container) {
			resizeObserver.unobserve(container);
		}
	});
</script>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
	}
    input[type="range"] {
		accent-color: steelblue;
	}
</style>

<div class="chart-container flex justify-center items-center" bind:this={container}></div>
<div class="flex w-full gap-x-[1rem] px-[2rem] items-center">
    <h1 class="text-4xl font-semibold">{selectedYear}</h1>
    <input
        id="year-slider"
        type="range"
        min={minYear}
        max={maxYear}
        bind:value={selectedYear}
        class="w-full px-2 mt-2"
    />
</div>
