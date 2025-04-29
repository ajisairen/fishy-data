<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import * as d3 from 'd3';

	export let data;
	export let duration = 750;
	export let pauseBetweenYears = 500;
	export let playBarAnimation = false;

	const dispatch = createEventDispatcher();

	let animationState = {
		currentKeyframeIndex: 0,
		isAnimating: false,
		currentTransition: null,
		yearComplete: true
	};

	const width = 1000;
	const barSize = 64;
	const marginTop = 16;
	const marginRight = 120;
	const marginBottom = 6;
	const marginLeft = 120;

	const names = new Set(data.map((d) => d.name));
	const n = names.size;

	const height = marginTop + barSize * n + marginBottom;

	const formatNumber = d3.format(',d');
	const formatYear = d3.format('d');

	let svg;
	let container;
	let keyframes = [];
	let x, y, color, axis, bars, labels, ticker;
	let prev, next;

	let selectedYear;
    let minYear, maxYear;
	let showSlider = false;

	onMount(() => {
		svg = d3
			.select(container)
			.append('svg')
			.attr('viewBox', [0, 0, width, height])
			.attr('width', width)
			.attr('height', height);

		const yearData = {};

		data.forEach((d) => {
			const year = +d.year;
			if (!yearData[year]) {
				yearData[year] = new Map();
			}
			yearData[year].set(d.name, d.value);
		});

		keyframes = createKeyframes(yearData);

		minYear = d3.min(keyframes, ([year]) => year);
        maxYear = d3.max(keyframes, ([year]) => year);
        selectedYear = maxYear;

		y = d3
			.scaleBand()
			.domain(d3.range(n))
			.rangeRound([marginTop, marginTop + barSize * n])
			.padding(0.1);

		x = d3
			.scaleLinear()
			.domain([0, d3.max(keyframes, ([, data]) => d3.max(data, (d) => d.value))])
			.range([marginLeft, width - marginRight]);

		color = d3.scaleOrdinal().domain(Array.from(names)).range(d3.schemeTableau10);

		const nameframes = d3.groups(
			keyframes.flatMap(([year, data]) => data),
			(d) => d.name
		);

		prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
		next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

		axis = createAxis(svg, x, y, n);
		bars = createBars(svg, x, y, color, prev, next);
		labels = createLabels(svg, x, y, prev, next);
		ticker = createTicker(svg);

		if (keyframes.length > 0) {
			const firstFrame = keyframes[0];
			updateFrame(firstFrame, false);
		}

		if (playBarAnimation) {
			startAnimation();
		}
	});

	$: {
		if (svg && keyframes.length > 0) {
			if (playBarAnimation && !animationState.isAnimating) {
				startAnimation();
			} else if (!playBarAnimation && animationState.isAnimating) {
				pauseAnimation();
			}
		}
	}

	function updateChartForYear(year) {
        const keyframe = keyframes.find(([y]) => y === year);
        if (keyframe) {
            updateFrame(keyframe, false);
        }
    }

	function startAnimation() {
		if (!animationState.isAnimating && keyframes.length > 0) {
			animationState.isAnimating = true;
			animate();
		}
	}

	function pauseAnimation() {
		animationState.isAnimating = false;
		if (animationState.currentTransition) {
			svg.interrupt();
		}
	}

	function resetAnimation() {
		pauseAnimation();
		animationState.currentKeyframeIndex = 0;
		animationState.yearComplete = true;

		if (keyframes.length > 0) {
			const firstFrame = keyframes[0];
			updateFrame(firstFrame, false);
		}

		dispatch('reset');
	}

	export { startAnimation, pauseAnimation, resetAnimation };

	function createKeyframes(yearData) {
		const years = Object.keys(yearData).map(Number).sort(d3.ascending);

		function rank(year) {
			const currentData = Array.from(names, (name) => {
				let value = 0;

				for (let y = year; y >= Math.min(...years); y--) {
					if (yearData[y] && yearData[y].has(name)) {
						value = yearData[y].get(name);
						break;
					}
				}

				return { name, value, rank: 0 };
			});

			currentData.sort((a, b) => d3.descending(a.value, b.value));
			for (let i = 0; i < currentData.length; ++i) {
				currentData[i].rank = i;
			}

			return currentData;
		}

		const keyframes = [];

		years.forEach((year) => {
            if (year < 1999) return;
			keyframes.push([year, rank(year)]);
		});

		return keyframes;
	}

	function createAxis(svg, x, y, n) {
		const g = svg.append('g').attr('transform', `translate(0,${marginTop})`);

		const axis = d3
			.axisTop(x)
			.ticks(width / 160)
			.tickSizeOuter(0)
			.tickSizeInner(-barSize * n);

		return (_, transition) => {
			if (transition) {
				g.transition(transition).call(axis);
			} else {
				g.call(axis);
			}

			g.select('.tick:first-of-type text').remove();
			g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#ddd');
			g.select('.domain').remove();
		};
	}

	function createBars(svg, x, y, color, prev, next) {
		let bar = svg.append('g').attr('fill-opacity', 0.8).selectAll('rect');

		return ([year, data], transition) => {
			bar = bar
				.data(data, (d) => d.name)
				.join(
					(enter) =>
						enter
							.append('rect')
							.attr('fill', (d) => color(d.name))
							.attr('height', y.bandwidth())
							.attr('x', marginLeft)
							.attr('y', (d) => y((prev.get(d) || d).rank))
							.attr('width', (d) => Math.max(0, x((prev.get(d) || d).value) - marginLeft)),
					(update) => update,
					(exit) =>
						exit
							.transition(transition)
							.remove()
							.attr('y', (d) => y((next.get(d) || d).rank))
							.attr('width', (d) => Math.max(0, x((next.get(d) || d).value) - marginLeft)));
			if (transition) {
				bar
					.transition(transition)
					.attr('y', (d) => y(d.rank))
					.attr('width', (d) => Math.max(0, x(d.value) - marginLeft));
			} else {
				bar.attr('y', (d) => y(d.rank)).attr('width', (d) => Math.max(0, x(d.value) - marginLeft));
			}
		};
	}

	function createLabels(svg, x, y, prev, next) {
		let label = svg
			.append('g')
			.style('font', 'bold 12px sans-serif')
			.style('font-variant-numeric', 'tabular-nums')
			.attr('text-anchor', 'start')
			.selectAll('text');

		return ([year, data], transition) => {
			label = label
				.data(data, (d) => d.name)
				.join(
					(enter) => {
						const text = enter
							.append('text')
							.attr(
								'transform',
								(d) =>
									`translate(${Math.max(marginLeft, x((prev.get(d) || d).value) + 5)},${y((prev.get(d) || d).rank) + y.bandwidth()})`
							)
							.attr('dy', '-0.5em')
							.text((d) => d.name);

						text
							.append('tspan')
							.attr('fill-opacity', 0.7)
							.attr('font-weight', 'normal')
							.attr('x', 10)
							.attr('dx', '-.75em')
							.attr('dy', '1.75em')
							.text((d) => formatNumber((prev.get(d) || d).value));

						return text;
					},
					(update) => update,
					(exit) =>
						exit
							.transition(transition)
							.remove()
							.attr(
								'transform',
								(d) =>
									`translate(${Math.max(marginLeft, x((next.get(d) || d).value) + 5)},${y((next.get(d) || d).rank) + y.bandwidth() / 2})`
							));
			if (transition) {
				label
					.transition(transition)
					.attr(
						'transform',
						(d) =>
							`translate(${Math.max(marginLeft, x(d.value) + 5)},${y(d.rank) + y.bandwidth() / 2})`
					)
					.call((g) =>
						g.select('tspan').tween('text', (d) => {
							const i = d3.interpolateNumber((prev.get(d) || d).value, d.value);
							return function (t) {
								this.textContent = formatNumber(i(t));
							};
						})
					);
			} else {
				label
					.attr(
						'transform',
						(d) =>
							`translate(${Math.max(marginLeft, x(d.value) + 5)},${y(d.rank) + y.bandwidth() / 2})`
					)
					.select('tspan')
					.text((d) => formatNumber(d.value));
			}
		};
	}

	function createTicker(svg) {
		const now = svg
			.append('text')
			.style('font', `bold ${barSize}px sans-serif`)
			.style('font-variant-numeric', 'tabular-nums')
			.attr('text-anchor', 'end')
			.attr('x', width - marginRight)
			.attr('y', marginTop + barSize * (n - 0.45))
			.attr('dy', '0.32em')
			.text('');

		return ([year], transition) => {
			if (transition) {
				transition.end().then(() => now.text(formatYear(year)));
			} else {
				now.text(formatYear(year));
			}
		};
	}

	function updateFrame(keyframe, useTransition = false) {
		x.domain([0, d3.max(keyframe[1], (d) => d.value)]);

		let transition = null;
		if (useTransition) {
			transition = svg.transition().duration(duration).ease(d3.easeLinear);

			animationState.currentTransition = transition;
		}

		axis(keyframe, transition);
		bars(keyframe, transition);
		labels(keyframe, transition);
		ticker(keyframe, transition);

		dispatch('yearChange', { year: keyframe[0] });

		return transition;
	}

	async function animate() {
		if (!animationState.isAnimating) return;

		while (animationState.currentKeyframeIndex < keyframes.length && animationState.isAnimating) {
			const currentKeyframe = keyframes[animationState.currentKeyframeIndex];

			if (animationState.yearComplete) {
				animationState.yearComplete = false;

				const transition = updateFrame(currentKeyframe, true);

				try {
					if (transition) await transition.end();

					animationState.yearComplete = true;
					animationState.currentTransition = null;

					if (pauseBetweenYears > 0 && animationState.isAnimating) {
						await new Promise((resolve) => setTimeout(resolve, pauseBetweenYears));
					}

					animationState.currentKeyframeIndex++;

					if (animationState.currentKeyframeIndex >= keyframes.length) {
						dispatch('complete');
						animationState.isAnimating = false;
						showSlider = true;
						return;
					}
				} catch (e) {
					animationState.yearComplete = true;
					animationState.currentTransition = null;
					return;
				}
			}
		}
	}
</script>

<div bind:this={container}></div>

{#if showSlider}
	<div class="flex w-full gap-x-[1rem] px-[2rem] items-center mt-4"
	transition:fade={{ duration: 500 }}
	>
		<h1 class="text-4xl font-semibold">{selectedYear}</h1>
		<input
			id="year-slider"
			type="range"
			min={minYear}
			max={maxYear}
			bind:value={selectedYear}
			class="w-full px-2 mt-2"
			on:input={() => updateChartForYear(selectedYear)}
		/>
	</div>
{/if}

<style>
	div {
		width: 100%;
		height: 100%;
		margin: 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: visible;
	}

	input[type="range"] {
        accent-color: steelblue;
    }
</style>

