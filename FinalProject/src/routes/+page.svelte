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
    import SpeciesByLakePieChart from "$lib/components/SpeciesByLakePieChart.svelte";

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
        if (value === "") return fish;
        const filtered = fish.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        return filtered;
    }

    function getLakes(selectedFish) {
        if (!selectedFish || !speciesToLake[selectedFish]) return [];

        const entries = Object.entries(speciesToLake[selectedFish]);
        const sorted = entries.sort(([, a], [, b]) => b - a);

        return sorted.slice(0, 3).map(([lake, proportion]) => ({
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
                    The fish survey counts appear stable over the years with the exception of two major discrepancies that occur in 2005-2007 and 2020. <b style="color: rgb(249, 148, 86);">Click on these points to learn more about what happened.</b>
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
            We see that <b style="color: rgb(249, 148, 86);">the population counts of each lake vary significantly year-to-year.</b> However, Lake of the Woods and Leech Lake are consistently within the top 5 ranks. We can largely attribute this 
            to the lakes' high population of Yellow Perch which tend to have extremely high population and survey counts. 
        </p>
        <p>
            While we <b style="color: rgb(249, 148, 86);">do </b> recommend fishing these lakes because of their simultaneously large 
            Walleye populations, we suggest to be weary of these results if Yellow Perch are not your target catch because they have potentially scewed these findings.
        </p>
    </div>
</div>
<div class="h-screen w-[100vw] flex justify-center items-center">
    <div class="mx-[4rem] w-4/5 flex justify-center items-center h-full">
        <p class="text-3xl">Here we analyze how fish sizes change from lake to lake. It is evident that <b style="color: rgb(249, 148, 86);">lakes are generally skewed towards smaller sized fish.</b> Use this tool to help find a lake that has a high population of the size of fish you like to catch.</p>
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
        <div class="py-[2rem] relative transition-all duration-500 ease-out w-3/4 flex flex-col gap-y-4 justify-start items-center">
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
        {#if selectedFish!="" && !inputFocused}
            <div class="flex flex-col w-3/4 -mt-[1rem]">
                <div class="col-span-3 flex flex-col py-4 items-center gap-x-4">
                    <div class="flex w-full gap-x-[2rem] items-center">
                        <h1 class="text-4xl font-bold">1.</h1>
                        <p class="text-2xl">{lakeRecommendations[0].lake}</p>
                    </div>
                    <SpeciesByLakePieChart lake={lakeRecommendations[0].lake} species={selectedFish} width={500} />
                </div>
                <div class="grid grid-cols-2 w-full">
                    {#each lakeRecommendations.slice(1, lakeRecommendations.length) as lakeObj, idx}
                        <div class="flex flex-col py-4 pl-8 items-center gap-x-2">
                            <div class="flex w-full gap-x-[2rem] items-center">
                                <h1 class="text-2xl font-bold">{idx+2}.</h1>
                                <p class="text-lg">{lakeObj.lake}</p>
                            </div>
                                <SpeciesByLakePieChart lake={lakeObj.lake} species={selectedFish} width={300} />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>
