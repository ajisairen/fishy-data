<script lang="ts">
    import { gsap } from "gsap";
    import {onMount} from "svelte"

    import weightedAveragePopulationOverTime from "$lib/weighted_average_species_population_over_time.json";
    import lakePopulationsOverTime from "$lib/lake_populations_over_time.json";
    import speciesToLake from "$lib/speciesToLake.json";

    import MultiLineChart from "$lib/components/MultiLineChart.svelte";
    import RacingBarChart from "$lib/components/RacingBarChart.svelte"
    import SpeciesPopulationAnalysis from "$lib/components/SpeciesPopulationAnalysis.svelte";
    import LakeSpeciesSizeViolinChart from "$lib/components/LakeSpeciesSizeViolinChart.svelte"

    import { ScrollToPlugin } from "gsap/ScrollToPlugin";
    import { MotionPathPlugin } from "gsap/MotionPathPlugin";
    import {ScrollTrigger} from "gsap/ScrollTrigger";

    let curFish = $state("");
    let fishInputValue = $state("");
    let yapText = $state("In this exploration, we will begin by inspecting Minnesota DNR surveys of fish species population levels in lakes from 1999 to 2023 and then make inferences about the population levels as a whole. Next, we will analyze how lake populations have evolved over time with the same data. To help give suggestions of where to fish, we will reveal which lakes yield larger fish. Finally, we will give a hierachircal overview of Minnesota's fish population make up.");
    let showPopulationChart = $state(false);
    let playBarAnimation = $state(false);
    let showSideSpecies = $state(true);
    let selectedPoint = $state(0);
    let inputFocused = $state(false);

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
<div id="parentOfFishContainers">
    <div id='explainPopChartContainer' class="h-[200vh]"></div>
    {#each fish as _fish, idx }
        <div id={`container${idx}`} class="h-[200vh]">
        </div>
    {/each}
</div>
<div class="h-screen w-[100vw] flex justify-center items-center">
    <RacingBarChart data={lakePopulationsOverTime} playBarAnimation={playBarAnimation} />
    }
    
    onMount(() => {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MotionPathPlugin);

        gsap.timeline({
            scrollTrigger: {
                trigger: '#barChartRaceContainer',
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 1,
                onEnter: () => {
                    showPopulationChart = false;
                    showSideSpecies = false;
                    playBarAnimation = true;
                },
            }
        });

        console.log(speciesToLake)

        gsap.timeline({
            scrollTrigger: {
                trigger: '#weightedAveragePopChart',
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 1,
                onEnter: () => {
                    showPopulationChart = false;
                    showSideSpecies = false;
                },
                onEnterBack: () => {
                    playBarAnimation = false;
                },
            }
        });        
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

    function getFish(value) {
        if (value === "") return []
        const filtered = fish.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        return filtered;
    }

    function getLakes(selectedFish) {
        if (!selectedFish || !speciesToLake[selectedFish]) return [];

        const entries = Object.entries(speciesToLake[selectedFish]);
        const sorted = entries.sort(([, a], [, b]) => b - a);

        return sorted.slice(0, 4).map(([lake, proportion]) => ({
            lake,
            proportion
        }));
    }

    let filteredFish = $derived(getFish(fishInputValue));
    let selectedFish = $state("");
    let lakeRecommendations = $derived(getLakes(selectedFish));
</script>
<SpeciesPopulationAnalysis bind:showSideSpecies={showSideSpecies} bind:showPopulationChart={showPopulationChart} />
<div id="weightedAveragePopChart" class="w-[100vw] flex justify-center items-center h-[150vh]">
    <div class="ml-[2rem] w-4/5 flex justify-center items-center h-[calc(100vh-4rem)]">
        <div class="text-3xl w-3/4 h-full items-center justify-center flex flex-col gap-y-[2rem]">
            {#if selectedPoint===2007}
                <p class="text-xl">
                    From 1999 to 2005, the Minnesota DNR was surveying from an average of 2 lakes (1.83) compared to the 7 in 2006 and an average of 7 lakes from 2006-2023. Clearly the DNR undertook a notable effort to survey more lakes in 2006 which consequently resulted in the data appearing have a large spike in fish populations in 2006-2007. It is important to note that the DNR's surveying effort appears to be consistent from 2006 to 2023.
                </p>
                <p class="text-xl">
                    This aligns with findings of the research we conducted on the DNR's fiscal spending report of 2007. The DNR increased spendature on the surveying of fisheries by just over $11,000,000 from 2006 to 2007.
                </p>
            {:else if selectedPoint===2020}
                <p class="text-xl">
                    At the height of the COVID-19 Pandemic, the DNR experienced a reduction of work due to restrictions imposed by the government. To compensate, the DNR reduced the Fish Management budget by $8,000,000 from the previous 2019 budget.
                </p>
                <p class="text-xl">
                    Consequently, it is reasonable to believe that the DNR's weakened surveying efforts are the reason behind this noticable dip in the population counts for 2020.
                </p>
            {:else}
                <p>
                    The fish survey counts appear stable over the years with the exception of two major discrepancies that occur in 2005-2007 and 2020. <b>Click on these points to learn more about what happened.</b>
                </p>
            {/if}
        </div>
    </div>
    <div class="w-full flex flex-col gap-y-[2rem]">
        <h1 class="text-2xl font-semibold">Weighted Average Survey Counts vs. Time</h1>
        <MultiLineChart setSelectedPoint={(_selectedPoint: number) => selectedPoint=_selectedPoint} rawData={weightedAveragePopulationOverTime} focusedSpecies="" isAvg={true} />
    </div>
</div>
<div id="barChartRaceContainer" class="-mt-[25vh] h-screen w-[100vw] flex justify-center items-center gap-x-[2rem]">
    <div class="w-full flex flex-col gap-y-[2rem]">
        <h1 class="ml-[120px] w-full text-2xl font-semibold">Survey Counts Of All Species In Lakes Over Time</h1>
        <RacingBarChart data={lakePopulationsOverTime} playBarAnimation={playBarAnimation} />
    </div>
    <div class="w-full flex flex-col justify-center items-start gap-y-[2rem] mr-[2rem] h-[calc(100vh-4rem)] text-2xl">
        <p>
            We see that the population counts of each lake vary significantly year-to-year. However, Lake of the Woods and Leech Lake are consistently within the top 5 ranks. We can largely attribute this 
            to the lakes' high population of Yellow Perch which tend to have extremely high population and survey counts. 
        </p>
        <p>
            While we <b>do </b> recommend fishing these lakes because of their simultaneously large 
            Walleye populations, we suggest to be weary of these results if Yellow Perch are not your target catch because they have potentially scewed these findings.
        </p>
    </div>
</div>
<div class="h-screen w-[100vw] flex justify-center items-center">
    <div class="mx-[4rem] w-4/5 flex justify-center items-center h-full">
        <p class="text-3xl">Here we analyze how fish sizes change from lake to lake. As expected, lakes are generally skewed towards smaller sized fish. Use this tool to help find a lake that has a high population of the size of fish you like to catch.</p>
    </div>
    <div class="w-full flex flex-col justify-center items-center gap-y-[2rem] mx-[2rem] h-full text-2xl">
        <h1 class="w-full text-2xl font-semibold">Surveyed Fish Sizes In Lakes</h1>
        <div class="h-2/3 w-full">
            <LakeSpeciesSizeViolinChart />
        </div>
    </div>
</div>
<div class="w-[100vw] h-screen flex justify-center items-center">
    <div class="h-full w-full max-w-[1280px] flex flex-col justify-start items-center">
        <div class="{inputFocused||selectedFish!='' ? 'translate-y-0' : 'translate-y-[40vh]'} py-[2rem] relative transition-all duration-500 ease-out w-3/4 flex flex-col gap-y-4 justify-center items-center">
            <h1 class="text-2xl font-semibold">What species do you want to fish?</h1>
            <input bind:value={fishInputValue} onfocus={() => inputFocused = true} type="text" class="focus:outline-none w-full px-8 py-4 rounded-xl border border-gray-400" />
            <div class="w-full flex flex-col py-1 transition-all duration-500 absolute bottom-0 translate-y-[calc(100%-2rem)] {inputFocused ? 'opacity-100 block' : 'opacity-0 hidden'}">
                {#each filteredFish as _fish}
                    <button onclick={() => {selectedFish=_fish, fishInputValue=_fish, inputFocused=false}} class="flex ease-in-out gap-x-[1rem] w-full py-1 px-2 group cursor-pointer">
                        <div class="w-1 rounded-l-full bg-black hidden group-hover:block"></div>
                        <p class="underline">
                            {_fish}
                        </p>
                    </button>
                {/each}
            </div>
        </div>
        {#if selectedFish!="" && !inputFocused}
            <div class="flex flex-col w-3/4 -mt-[1rem]">
                {#each lakeRecommendations as lakeObj, idx}
                    {#if idx===0}
                        <div class="col-span-3 flex py-4 items-center gap-x-4">
                            <h1 class="text-4xl font-bold text-blue-600">1.</h1>
                            <p class="text-2xl">{lakeObj.lake}</p>
                        </div>
                    {:else}
                        <div class="col-span-3 flex py-4 pl-8 items-center gap-x-2">
                            <h1 class="text-2xl font-bold">{idx+1}.</h1>
                            <p class="text-lg">{lakeObj.lake}</p>
                        </div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
</div>
