<script>
    import MapCard from "./MapCard.svelte";
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from 'svelte';
    import { activeMaps, mapData} from '../store';
    import { readJson, postJson } from '../api';
    export let userId;
    export let sse;

    const fetchMaps = (async () => {
        return await readJson('http://127.0.0.1:5500/maps', mapData);
    })();

    sse.addEventListener('DDG_EVENT_MAPBAN', (event) => {
        // update the store to trigger banned map effect
        let mapId = JSON.parse(event.data).mapId;
        mapData.update(current => {
            let maps = current.maps;
            let copied = [...maps];
            let target = copied.find((map) => {
                return map.mapId == mapId;
            });
            
            target.status = 1;
            return {maps: copied};
        });
    })

    let dispatch = createEventDispatcher();

    function handleBan(event) {
        postJson('http://127.0.0.1:5500/ban', JSON.stringify({
            userId: userId,
            mapId: event.detail.mapId
        }));
    }

    function selectMap(map) {
        if(isMapSelected()) {
            dispatch('changeBackground', { img: map[0] + ".png" })
        }
    }
</script>

{#await fetchMaps}
<p>receiving data</p>
{:then}
<div class="wrapper">
    <div class="holder">
        {#each $activeMaps as map, i}
            <div in:fly="{{delay: 1000 + 20 * i * i, y: 200, duration: 1000}}" out:fly="{{delay: 20 * (4-i) * (4-i), y: 200, duration: 500}}">
                <MapCard on:ban={handleBan} map_name={map.display_name} map_id={map.mapId} status={map.status}/>
            </div>
        {/each}
    </div>
</div>
{:catch _error}
<p>An error occoured</p>
{/await}

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
