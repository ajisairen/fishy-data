<script lang="ts">
	import '../app.css';
	import { startBubbleAnimation } from '$lib/components/bubbleAnimation.js';
    import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
        startBubbleAnimation();
    });
</script>

<div id="bubble-container" class="fixed inset-0 z-0 overflow-hidden"></div>
<div class="relative z-10">
    {@render children()}
</div>
<footer class="relative">
    <div class="wave wave1"></div>
    <div class="wave wave2"></div>
    <div class="wave wave3"></div>
</footer>