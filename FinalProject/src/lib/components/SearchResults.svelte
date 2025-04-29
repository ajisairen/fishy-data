<script lang="ts">
    import speciesToLake from "$lib/speciesToLake.json";

    import ModelViewer from '$lib/components/ModelViewer.svelte';
    import SpeciesByLakePieChart from "$lib/components/SpeciesByLakePieChart.svelte";
    
    const { selectedFish } = $props<{ selectedFish: string }>(); // string of selected fish name

    const fishModels: Record<string, string> = {
        "white sucker":         "/models/white_sucker.glb",
        walleye:                "/models/walleye.glb",
        pumpkinseed:            "/models/pumpkinseed.glb",
        bluegill:               "/models/bluegill.glb",
        "largemouth bass":      "/models/largemouth_bass.glb",
        "yellow perch":         "/models/yellow_perch.glb",
        "rock bass":            "/models/rock_bass.glb",
        "tullibee (cisco)":     "/models/tullibee_cisco.glb",
        "brown bullhead":       "/models/brown_bullhead.glb",
        "northern pike":        "/models/northern_pike.glb",
        "black crappie":        "/models/black_crappie.glb",
        "yellow bullhead":      "/models/yellow_bullhead.glb",
        burbot:                 "/models/burbot.glb",
        "shorthead redhorse":   "/models/shorthead_redhorse.glb"
    };

    const fishSizes: Record<string, number> = {
        "white sucker":         5,
        walleye:                5,
        pumpkinseed:            5,
        bluegill:               5,
        "largemouth bass":      25,
        "yellow perch":         5,
        "rock bass":            5,
        "tullibee (cisco)":     5,
        "brown bullhead":       5,
        "northern pike":        5,
        "black crappie":        5,
        "yellow bullhead":      5,
        burbot:                 5,
        "shorthead redhorse":   5
    };

    function getLakes(fish: string) {
        if (!selectedFish || !speciesToLake[selectedFish]) return [];

        const entries = Object.entries(speciesToLake[selectedFish]);
        const sorted = entries.sort(([, a], [, b]) => b - a);

        return sorted.slice(0, 3).map(([lake, proportion]) => ({
            lake,
            proportion
        }));
    }

    let lakeRecommendations = $derived(getLakes(selectedFish));
</script>

<div class="grid grid-cols-2 w-full">
    <div class="w-full flex flex-col py-4 pl-8 items-center gap-y-2">
        <div class="flex w-full gap-x-[2rem] items-center">
            <h1 class="text-4xl font-bold">1.</h1>
            <p class="text-2xl">{lakeRecommendations[0].lake}</p>
        </div>
        <SpeciesByLakePieChart lake={lakeRecommendations[0].lake} species={selectedFish} width={400} />
    </div>
    <div class="flex justify-center items-center border-1" style="background-color: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.25);">
        <ModelViewer modelPath={fishModels[selectedFish]} scale={fishSizes[selectedFish]} width=100% height=100%/>
    </div>
    {#each lakeRecommendations.slice(1, lakeRecommendations.length) as lakeObj, idx}
        <div class="w-full flex flex-col py-4 pl-8 items-center gap-y-2">
            <div class="flex w-full gap-x-[2rem] items-center">
                <h1 class="text-2xl font-bold">{idx+2}.</h1>
                <p class="text-lg">{lakeObj.lake}</p>
            </div>
            <SpeciesByLakePieChart lake={lakeObj.lake} species={selectedFish} width={400} />
        </div>
    {/each}
</div>
