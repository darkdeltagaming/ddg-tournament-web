<script>
    import MapCard from "./MapCard.svelte";
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from 'svelte';

    let map_names = [
        "vertigo",
        "inferno",
        "nuke",
        "lake",
        "chill",
    ];
    let banning = [...map_names];
    let dispatch = createEventDispatcher();

    $: selectMap(banning)

    function handleBan(event) {
        let index = banning.indexOf(event.detail.name);
        if(banning.length > 1 && index > -1) {
            banning.splice(index, 1);
        }
        banning = banning;
    }

    function isMapSelected() {
        return banning.length === 1;
    }

    function selectMap(map) {
        if(isMapSelected()) {
            dispatch('changeBackground', { img: map[0] + ".png" })
        }
    }
</script>

<div class="wrapper">
    <div class="holder">
        {#each map_names as map_name, i}
            <div in:fly="{{delay: 1000 + 20 * i * i, y: 200, duration: 1000}}" out:fly="{{delay: 20 * (4-i) * (4-i), y: 200, duration: 500}}">
                <MapCard on:ban={handleBan} map_name={map_name} banned={banning.indexOf(map_name) < 0} picked={banning.indexOf(map_name) === 0 && isMapSelected()}/>
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