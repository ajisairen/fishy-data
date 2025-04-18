<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import * as d3 from 'd3';

	// Accept data as a parameter
	export let data;

	// Control props
	export let duration = 750; // Transition duration in ms
	export let pauseBetweenYears = 500; // Pause between transitions in ms
	export let playBarAnimation = false; // Whether the animation should be playBarAnimation

	// Create event dispatcher for communicating with parent
	const dispatch = createEventDispatcher();

	// Animation state variables
	let animationState = {
		currentKeyframeIndex: 0,
		isAnimating: false,
		currentTransition: null, // To track active transition
		yearComplete: true // Whether current year transition is complete
	};

	// Configuration
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

	// Methods to control the animation
	function startAnimation() {
		if (!animationState.isAnimating && keyframes.length > 0) {
			animationState.isAnimating = true;
			animate();
		}
	}

	function pauseAnimation() {
		animationState.isAnimating = false;
		// If there's an active transition, interrupt it
		if (animationState.currentTransition) {
			svg.interrupt();
		}
	}

	function resetAnimation() {
		pauseAnimation();
		animationState.currentKeyframeIndex = 0;
		animationState.yearComplete = true;

		// Reset to first frame
		if (keyframes.length > 0) {
			const firstFrame = keyframes[0];
			updateFrame(firstFrame, false);
		}

		// Dispatch event
		dispatch('reset');
	}

	// Make these methods available to parent components
	export { startAnimation, pauseAnimation, resetAnimation };

	function createKeyframes(yearData) {
		// Sort years
		const years = Object.keys(yearData).map(Number).sort(d3.ascending);

		// Function to rank lakes for a given year
		function rank(year) {
			// Create data array for all lakes
			const currentData = Array.from(names, (name) => {
				// Find the most recent value for this lake up to this year
				let value = 0;

				// Look for the most recent year data
				for (let y = year; y >= Math.min(...years); y--) {
					if (yearData[y] && yearData[y].has(name)) {
						value = yearData[y].get(name);
						break;
					}
				}

				return { name, value, rank: 0 };
			});

			// Sort by value
			currentData.sort((a, b) => d3.descending(a.value, b.value));

			// Assign ranks
			for (let i = 0; i < currentData.length; ++i) {
				currentData[i].rank = i;
			}

			return currentData;
		}

		// Generate keyframes
		const keyframes = [];

		// Add a frame for each year
		years.forEach((year) => {
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
							.attr('width', (d) => Math.max(0, x((next.get(d) || d).value) - marginLeft))
				);

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
							)
				);

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

	// Update the frame without animation
	function updateFrame(keyframe, useTransition = false) {
		// Update the x scale domain
		x.domain([0, d3.max(keyframe[1], (d) => d.value)]);

		let transition = null;
		if (useTransition) {
			transition = svg.transition().duration(duration).ease(d3.easeLinear);

			// Store reference to the transition
			animationState.currentTransition = transition;
		}

		// Update the chart elements
		axis(keyframe, transition);
		bars(keyframe, transition);
		labels(keyframe, transition);
		ticker(keyframe, transition);

		// Dispatch event
		dispatch('yearChange', { year: keyframe[0] });

		return transition;
	}

	// Main animation loop
	async function animate() {
		if (!animationState.isAnimating) return;

		// Continue from current position
		while (animationState.currentKeyframeIndex < keyframes.length && animationState.isAnimating) {
			const currentKeyframe = keyframes[animationState.currentKeyframeIndex];

			// If we're starting a new year
			if (animationState.yearComplete) {
				animationState.yearComplete = false;

				// Create transition
				const transition = updateFrame(currentKeyframe, true);

				try {
					// Wait for transition to complete
					if (transition) await transition.end();

					// Transition is complete
					animationState.yearComplete = true;
					animationState.currentTransition = null;

					// Add pause between years if specified
					if (pauseBetweenYears > 0 && animationState.isAnimating) {
						await new Promise((resolve) => setTimeout(resolve, pauseBetweenYears));
					}

					// Move to next keyframe
					animationState.currentKeyframeIndex++;

					// Check if we've reached the end
					if (animationState.currentKeyframeIndex >= keyframes.length) {
						dispatch('complete');
						animationState.isAnimating = false;
						return;
					}
				} catch (e) {
					// Transition was interrupted
					animationState.yearComplete = true;
					animationState.currentTransition = null;
					return;
				}
			}
		}
	}
</script>

<div bind:this={container}></div>

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
</style>

