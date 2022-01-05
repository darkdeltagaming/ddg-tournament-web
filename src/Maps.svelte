<script>
    import MapCard from "./MapCard.svelte";
    import { fly } from "svelte/transition"
    import { onMount } from 'svelte';

    let map_names = [
        "vertigo",
        "inferno",
        "nuke",
        "lake",
        "chill",
    ]
    let ready = false;

    onMount(() => ready = true);
</script>

{#if ready}
<div class="wrapper">
    <div class="holder">
        {#each map_names as map_name, i}
            <div in:fly="{{delay: 800 + 100 * i, y: 200, duration: 1000}}">
                <MapCard id="map-card" map_name={map_name}/>
            </div>
        {/each}
    </div>
</div>
{/if}

<style>

    .wrapper {
        height: 80vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .holder {
        width: 90%;
        position: relative;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 2vw;
    }

</style>