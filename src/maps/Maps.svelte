<script>
    import MapCard from "./MapCard.svelte";
    import { fly, fade } from "svelte/transition";
    import { createEventDispatcher } from 'svelte';
    import { activeMaps, mapData} from '../store';
    import { readJson, postJson, getJson } from '../api';
    export let userId;
    export let sse;
    export let enableBans;
    let picked = false;

    const fetchMapInfo = (async () => {
        await readJson('http://127.0.0.1:5500/maps', mapData);
        console.log($mapData);
        console.log('Fetching ban info');
        enableBans = await getJson(`http://127.0.0.1:5500/allowBan/${userId}`);
        console.log('loaded ban info');
    })();

    sse.addEventListener('DDG_EVENT_MAPBAN', event => {
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
    });

    sse.addEventListener('DDG_EVENT_MAPPICK', event => {
        // update the store to trigger picked map effect
        picked = true;
        let mapId = JSON.parse(event.data).mapId;
        mapData.update(current => {
            let maps = current.maps;
            let copied = [...maps];
            let target = copied.find(map => map.mapId == mapId);

            target.status = 3;
            return {maps: copied};
        });
        selectMap(mapId);
    });

    sse.addEventListener('DDG_EVENT_ALLOWBAN', _ => {
        enableBans = true;
    });


    let dispatch = createEventDispatcher();

    function handleBan(event) {
        postJson('http://127.0.0.1:5500/ban', JSON.stringify({
            userId: userId,
            mapId: event.detail.mapId
        }));
        enableBans = false;
    }

    function selectMap(mapId) {
        dispatch('changeBackground', { img: `http://127.0.0.1:5500/mapImage/${mapId}` });
    }
</script>

{#await fetchMapInfo}
<p>receiving data</p>
{:then}
<div class="wrapper">
    <div class="holder {true ? '' : 'no-ban'}">
        {#each $activeMaps as map, i}
            <div in:fly="{{delay: 1000 + 20 * i * i, y: 200, duration: 1000}}" 
                out:fly="{{delay: 20 * (4-i) * (4-i), y: 200, duration: 500}}">
                <MapCard on:ban={handleBan} map_name={map.display_name} 
                    map_id={map.mapId} status={map.status} enableBans={enableBans}/>
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

    .no-ban div {
        position: relative;
    }

    .no-ban div::after {
        content: '';
        position: absolute;
        left: 0px;
        top: 0;
        height: 100%;
        width:100%;
        background: #181717;
        opacity: 0.5;
        border-left: 3px solid #181717;
        border-right: 3px solid #181717;
        border-radius: 10px;
    }

</style>
