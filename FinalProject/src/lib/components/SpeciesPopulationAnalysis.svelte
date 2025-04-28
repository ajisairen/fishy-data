<script>
    import averagePopulationOverTime from "$lib/average_species_population_over_time.json";

    import { gsap } from "gsap";
    import {onMount} from "svelte"
    import { ScrollToPlugin } from "gsap/ScrollToPlugin";
    import { MotionPathPlugin } from "gsap/MotionPathPlugin";
    import {ScrollTrigger} from "gsap/ScrollTrigger";
    import MultiLineChart from "$lib/components/MultiLineChart.svelte";

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
        "The walleye (Sander vitreus, synonym Stizostedion vitreum), also called the walleyed pike, or yellow pickerel, is a freshwater perciform fish native to most of Canada and to the Northern United States. The Walleye is potentially the most popularly fished species in Minnesota. We see that this species survey population increases from early 2000s to 2007 and then begins a very steady decline through 2024.",
        "Pumpkinseeds are freshwater fish that prefer warm, calm, clear water, especially in ponds, lakes and still pools in creek. They don’t venture far from the shore and tend to hide in vegetation and submerged objects. They tolerate low oxygen more easily than bluegills do, but they are more sensitive to warm water. Slightly smaller than the bluegill, pumpkinseeds are typically about 4 inches (10 centimeters) though they have been known to grow as long as 11 inches (28 centimeters). They usually weigh 1 pound (450 grams) or less.",
        "Bluegills are commonly found in warm, weedy lakes, ponds, and slow-moving streams across North America. They typically grow to about 6–10 inches long. They have a deep, flat body and are easily recognized by their dark vertical bars and the black spot on the rear edge of their gill cover.",
        "Preferring clear, quiet waters with lots of vegetation, largemouth bass are found in lakes, ponds, and rivers across the U.S. They can grow up to 20 inches or more and are known for their large mouths that extend past their eyes. Their greenish coloring with horizontal dark stripes helps them blend into their surroundings.",
        "Yellow perch inhabit cool lakes and slow-moving rivers, particularly in the northern U.S. and Canada. They usually reach 6–12 inches in length. Their bright golden-yellow bodies are accented with six to nine dark vertical bars, making them easily identifiable.",
        "Rock bass thrive in clear, rocky lakes and streams, especially near submerged logs or boulders. They typically range from 6 to 10 inches in size. Their reddish eyes and dark, mottled patterns across a bronzy body help distinguish them from other sunfish species.",
        "Tullibee, or cisco, are coldwater fish found in deep, clear northern lakes. They usually grow between 10–16 inches long. Their slender, silvery bodies and forked tails make them well-adapted to open water, where they feed on plankton and small insects.",
        "Often found in muddy-bottomed ponds, lakes, and sluggish rivers, brown bullheads thrive in low-oxygen environments. They typically reach 8–14 inches in length. Their brown or olive bodies are dotted with dark mottling, and they have distinctive whisker-like barbels around their mouths.",
        "Northern pike prefer cool, vegetated waters of lakes and rivers and are widely distributed across northern regions. They can grow quite large, often exceeding 30 inches. Their long, torpedo-shaped bodies are marked with light-colored spots over a green or olive background, ideal for ambushing prey.",
        "Black crappie live in calm, vegetated waters of lakes and reservoirs. They usually grow to 8–12 inches. Their silvery bodies are speckled with irregular black blotches, giving them a spotted appearance, and they tend to school in deeper water during the day.",
        "Yellow bullheads are adaptable bottom-dwellers found in warm, slow-moving streams and lakes. They typically reach 6–12 inches. With a yellow to brownish body and light-colored chin barbels, they’re easy to distinguish from their brown and black bullhead cousins.",
        "Burbot are cold-loving, bottom-dwelling fish that live in deep lakes and rivers, often under ice in the winter. They average around 16–24 inches long. Resembling a freshwater cod, they have a single chin barbel and mottled, eel-like bodies that range in brownish shades.",
        "This species favors clean, flowing rivers and streams with gravelly bottoms. Shorthead redhorses typically grow 12–20 inches. They have a blunt, reddish tail and a silvery body with a slight copper hue, and their underslung mouths are adapted for bottom feeding."
    ]

    let curFish = $state("");
    let yapText = $state("In this exploration, we will begin by inspecting Minnesota DNR surveys of fish species population levels in lakes from 1999 to 2023 and then make inferences about the population levels as a whole. Next, we will analyze how lake populations have evolved over time with the same data. To help give suggestions of where to fish, we will reveal which lakes yield larger fish. Finally, we will help readers find lakes that have the highest survey counts of their fish species of interest.");
    let { showPopulationChart = $bindable(), showSideSpecies = $bindable() } = $props();

    function createFishTrigger({ containerId, fishName, text = "" }) {
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
                    yapText = "In this exploration, we will begin by inspecting Minnesota DNR surveys of fish species population levels in lakes from 1999 to 2023 and then make inferences about the population levels as a whole. Next, we will analyze how lake populations have evolved over time with the same data. To help give suggestions of where to fish, we will reveal which lakes yield larger fish. Finally, we will give a hierachircal overview of Minnesota's fish population make up."
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
                    showPopulationChart = true;
                }
            }
        });

        tl.to("#subbox", { width: "30vw", height: "calc(100vh - 4rem)" })
            .to(".fishbox", { fontSize: "1rem" }, 0)
            .to("#descContainer", {
                left: "calc(30vw + 4rem)",
                bottom: "calc(2rem)",
                width: "calc(70vw - 4rem)",
                height: "calc(30vh)",
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

        gsap.timeline({
            scrollTrigger: {
                trigger: '#spacer',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onEnterBack: () => {
                    showPopulationChart = true;
                    showSideSpecies = true;
                },
            }
        });        

        for (let i = 0; i < fish.length; i++) {
            createFishTrigger({ containerId: `container${i}`, fishName: fish[i], text: fishDialog.length > i ? fishDialog[i] : "" });
        }
    });    
</script>
<div id="containerIntro" class="h-[200vh] w-[100vw]">
    <div id="subbox" class="fixed flex flex-col left-8 bottom-8 border bg-none rounded-md border-gray-400 h-[50vh] w-[20vw] { !showSideSpecies ? 'opacity-0 -z-40' : 'opacity-100 z-0'}">
        {#each fish as _fish, idx}
            <button onclick={() => document.getElementById(`container${idx}`).scrollIntoView({ behavior: 'smooth' })} class="cursor-pointer fishbox w-full h-full text-sm flex px-8 items-center transition-all duration-300 ease-in-out {idx !== fish.length-1 ? 'border-b border-gray-400' : ''} {curFish===_fish ? 'bg-white text-black px-[4rem]' : 'bg-none text-white'}"> {_fish[0].toUpperCase() + _fish.slice(1)}
            </button>
        {/each}
    </div>
    <div class="border-b border-b-gray-400 bg-[url(/images/waves.svg)] bg-white h-[calc(50vh-4rem)] w-[100vw] px-8 flex items-center justify-evenly">
        <div class="font-semibold text-start text-5xl 2xl:text-8xl text-outline">
            <!-- Why are fish populations falling? -->
            <!-- What makes a species popular to fish? -->
            The Guidebook to Minnesotan Fishing and Species Population Patterns
        </div>
    </div>
    <div id="descContainer" class="flex flex-col justify-start items-start border-l border-l-gray-400 gap-y-8 px-8 py-8 h-[calc(50vh+4rem)] w-[calc(80vw-4rem)] left-[calc(20vw+4rem)] fixed { !showSideSpecies ? 'opacity-0 -z-40' : 'opacity-100 z-0'}">
        <p id="yapContainer" class="text-1xl 2xl:text-2xl text-start w-full">{yapText}</p>
        <div id="downArrow" class="rounded-full p-8 bg-gray-900 w-[100px] h-[100px] flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#faf9f6" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
        </div>
    </div>
</div>
<div class="left-[calc(30vw+4rem)] top-[2rem] w-[calc(70vw-8rem)] h-[calc(70vh-8rem)] fixed transition-all duration-300 ease-in-out {showPopulationChart ? 'opacity-100' : 'opacity-0 -z-10' }">
    <MultiLineChart rawData={averagePopulationOverTime} focusedSpecies={curFish} />
</div>
<div class="fixed right-8 bottom-8 {showPopulationChart ? 'opacity-100' : 'opacity-0'}">
(scroll)
</div>
<div id="parentOfFishContainers">
    <div id='explainPopChartContainer' class="h-[50vh]"></div>
    {#each fish as _fish, idx }
        <div id={`container${idx}`} class="h-[50vh]">
        </div>
    {/each}
</div>
<div id="spacer" class="h-[150vh]">
</div>
