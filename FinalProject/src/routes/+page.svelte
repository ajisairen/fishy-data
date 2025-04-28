<script lang="ts">
    import { gsap } from "gsap";
    import {onMount} from "svelte"

    import averagePopulationOverTime from "$lib/average_species_population_over_time.json";
    import lakePopulationsOverTime from "$lib/lake_populations_over_time.json";

    import MultiLineChart from "$lib/components/MultiLineChart.svelte";
    import RacingBarChart from "$lib/components/RacingBarChart.svelte"
    
    import { ScrollToPlugin } from "gsap/ScrollToPlugin";
    import { MotionPathPlugin } from "gsap/MotionPathPlugin";
    import {ScrollTrigger} from "gsap/ScrollTrigger";

    let curFish = $state("");
    let yapText = $state("In this exploration, we will investigate fish populations and patterns such as their growth rates in Lakes, how their sizes have evolved, and the effect of stocking on their populations. In doing this we can shed light on potential future patterns and explanations to said patterns.");
    let showPopulationChart = $state(false);
    let playBarAnimation = $state(false);

    function createFishTrigger({ containerId, fishName, text = "" }: { containerId: string, fishName: string, text?: string}) {
        gsap.timeline({
            scrollTrigger: {
                trigger: `#${containerId}`,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onEnter: () => {
                    curFish = fishName;
                    yapText = text;
                },
                onEnterBack: () => {
                    curFish = fishName;
                    yapText = text;
                },
            }
        });
    }
    
    onMount(() => {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MotionPathPlugin);
        
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#containerIntro',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onEnterBack: () => {
                    curFish = "";
                    yapText = "In this exploration, we will investigate fish populations and patterns such as their growth rates in Lakes, how their sizes have evolved, and the effect of stocking on their populations. In doing this we can shed light on potential future patterns and explanations to said patterns."
                    showPopulationChart = false;
                },
            }
        });
        
        gsap.timeline({
            scrollTrigger: {
                trigger: '#parentOfFishContainers',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onEnter: () => {
                    showPopulationChart = true;
                },
                onEnterBack: () => {
                    curFish = "";
                    // yapText = "In this exploration, we will investigate fish populations and patterns such as their growth rates in Lakes, how their sizes have evolved, and the effect of stocking on their populations. In doing this we can shed light on potential future patterns and explanations to said patterns."
                    showPopulationChart = true;
                    playBarAnimation = false;
                },
                onLeave: () => {
                    showPopulationChart = false;
                    playBarAnimation = true;
                }
            }
        });        
        
        tl.to("#subbox", { width: "30vw", height: "calc(100vh - 4rem)" })
            .to(".fishbox", { fontSize: "1rem" }, 0)
            .to("#descContainer", {
                left: "calc(30vw + 4rem)",
                bottom: "calc(2rem)",
                width: "calc(70vw - 4rem)",
                height: "calc(30vh + 4rem)",
                paddingTop: 0
            }, 0)
            .to("#downArrow", {
                opacity: 0
            }, 0);

        gsap.timeline({
            scrollTrigger: {
                trigger: '#explainPopChartContainer',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onEnter: () => {
                    yapText = "This chart is a reflection of how the populations of fish species evolve over time. The y-axis represents the total surveying count across all of the lakes in Minnesota averaged over the number of lakes each species was surveyed in for that given year. Utilizing a logrithmic y-scale because yellow perch abundancy in Minnesota."
                    curFish = "";
                },
                onEnterBack: () => {
                    yapText = "This chart is a reflection of how the populations of fish species evolve over time. The y-axis represents the total surveying count across all of the lakes in Minnesota averaged over the number of lakes each species was surveyed in for that given year. Utilizing a logrithmic y-scale because yellow perch abundancy in Minnesota."
                    curFish = "";
                }
            }
        });        

        for (let i = 0; i < fish.length; i++) {
            createFishTrigger({ containerId: `container${i}`, fishName: fish[i], text: fishDialog.length > i ? fishDialog[i] : "" });
        }
    });
    
    const fish = [
        'white sucker',
        'walleye',
        'pumpkinseed',
        'bluegill',
        'largemouth bass',
        'yellow perch',
        'rock bass',
        'tullibee (cisco)',
        'brown bullhead',
        'northern pike',
        'black crappie',
        'yellow bullhead',
        'burbot',
        'shorthead redhorse'
    ];

    const fishDialog = [
        "The white sucker is a species of freshwater cypriniform fish inhabiting the upper Midwest and Northeast in North America, but it is also found as far south as Georgia and as far west as New Mexico. This data illustrates a slight increase and upward trend to the white sucker's population levels.",
        "The walleye (Sander vitreus, synonym Stizostedion vitreum), also called the walleyed pike, or yellow pickerel, is a freshwater perciform fish native to most of Canada and to the Northern United States. The Walleye is potentially the most popularly fished species in Minnesota. We see that this species survey population increases from early 2000s to 2007 and then begins a very steady decline through 2024."
    ]
</script>

<div id="containerIntro" class="h-[200vh] w-[100vw]">
    <div id="subbox" class="fixed flex flex-col left-8 bottom-8 border bg-none rounded-md border-gray-400 h-[50vh] w-[20vw] { playBarAnimation ? 'opacity-0 -z-40' : 'opacity-100 z-0'}">
        {#each fish as _fish, idx}
            <div class="fishbox w-full h-full text-sm flex px-8 items-center transition-all duration-300 ease-in-out {idx !== fish.length-1 ? 'border-b border-gray-400' : ''} {curFish===_fish ? 'bg-black text-[#faf9f6] px-[4rem]' : 'bg-none text-black'}">
                {_fish[0].toUpperCase() + _fish.slice(1)}
            </div>
        {/each}
    </div>
    <div class="border-b border-b-gray-400 h-[calc(50vh-4rem)] w-[100vw] px-8 flex items-center justify-evenly">
        <div class="font-semibold text-start" style="font-size: 6em;">
            <!-- Why are fish populations falling? -->
            <!-- What makes a species popular to fish? -->
            How have fishing populations and patterns changed over time?
        </div>
    </div>
    <div id="descContainer" class="flex flex-col justify-start items-start border-l border-l-gray-400 gap-y-8 px-8 py-8 h-[calc(50vh+4rem)] w-[calc(80vw-4rem)] left-[calc(20vw+4rem)] fixed { playBarAnimation ? 'opacity-0 -z-40' : 'opacity-100 z-0'}">
        <p id="yapContainer" class="text-4xl text-start w-full">{yapText}</p>
        <div id="downArrow" class="rounded-full p-8 bg-gray-900 w-[100px] h-[100px] flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#faf9f6" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
        </div>
    </div>
</div>
<div class="left-[calc(30vw+4rem)] top-[2rem] w-[calc(70vw-8rem)] h-[calc(70vh-8rem)] fixed transition-all duration-300 ease-in-out {showPopulationChart ? 'opacity-100' : 'opacity-0' }">
    <MultiLineChart rawData={averagePopulationOverTime} focusedSpecies={curFish} />
</div>
<div class="fixed right-8 bottom-8 {showPopulationChart ? 'opacity-100' : 'opacity-0'}">
(scroll)
</div>
<div class="w-[100vw] h-screen flex justify-center items-center">
    <div class="h-full w-full max-w-[1280px] flex flex-col justify-start items-center">
        <div class="py-[2rem] relative transition-all duration-500 ease-out w-3/4 flex flex-col gap-y-4 justify-start items-center">
            <h1 class="text-3xl font-bold">Find lakes with the species you want!</h1>
            <h1 class="text-2xl font-semibold">What species do you want to fish?</h1>
            <div class="flex flex-col gap-y-[1rem] w-full">
                <input bind:value={fishInputValue} onfocus={() => inputFocused = true} type="text" onblur={() => inputFocused = false} placeholder="Enter fish species name" class="focus:outline-none w-full px-8 py-4 rounded-xl border border-gray-400" />
                <div class="w-full flex rounded-xl border border-white p-1 flex-col py-1 transition-all duration-500 {inputFocused ? 'opacity-100' : 'opacity-0'}" >
                    {#each filteredFish as _fish}
                        <button onclick={() => {selectedFish=_fish, fishInputValue=_fish, inputFocused=false}} class="flex ease-in-out gap-x-[1rem] w-full py-1 px-2 group cursor-pointer">
                            <div class="w-1 rounded-l-full bg-white hidden group-hover:block"></div>
                            <p class="underline">
                                {_fish}
                            </p>
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    {/each}
</div>
<div class="h-screen w-[100vw] flex justify-center items-center">
    <RacingBarChart data={lakePopulationsOverTime} playBarAnimation={playBarAnimation} />
</div>
