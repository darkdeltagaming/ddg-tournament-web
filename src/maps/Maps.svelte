<script>
    import MapCard from "./MapCard.svelte";
    import { fly } from "svelte/transition"

    let map_names = [
        "vertigo",
        "inferno",
        "nuke",
        "lake",
        "chill",
    ]
</script>

<div class="wrapper">
    <div class="holder">
        {#each map_names as map_name, i}
            <div in:fly="{{delay: 1000 + 20 * i * i, y: 200, duration: 1000}}">
                <MapCard id="map-card" map_name={map_name}/>
            </div>
        {/each}
    </div>
</div>

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