<script lang="ts">
    import speciesToLake from "$lib/speciesToLake.json";

    import ModelViewer from '$lib/components/ModelViewer.svelte';
    import SpeciesByLakePieChart from "$lib/components/SpeciesByLakePieChart.svelte";
    
    const { selectedFish } = $props<{ selectedFish: string }>(); // string of selected fish name

    function getLakes(fish: string) {
        if (!selectedFish || !speciesToLake[fish]) return [];

        const entries = Object.entries(speciesToLake[fish]);
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
        <ModelViewer species={selectedFish} width=100% height=100%/>
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
