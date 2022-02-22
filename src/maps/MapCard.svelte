<script>
    import { createEventDispatcher } from 'svelte';
    import BannedIcon from '../svg/bannedIcon.svelte';
    import PickedIcon from '../svg/pickedIcon.svelte';
    export let map_name;
    export let map_id;
    export let status;

    const dispatch = createEventDispatcher();

    function dispatchBan() {
        dispatch('ban', { mapId: map_id });
    }

    export function pickMap() {
        picked = true;
    }

</script>

<div class="card {status === 1 ? 'banned' : status === 2 ? 'picked' : ''}" style="--image: url('http://127.0.0.1:5500/mapImage/{map_id}');" on:click={dispatchBan}> 
    <div class="background"></div>
    {#if status === 1}
        <BannedIcon />
    {/if}
    {#if status === 2}
        <PickedIcon />
    {/if}
    <div class="headline">
        <p>{map_name.toUpperCase()}</p>
    </div>
</div>

<style>

    .card {
        position: relative;
        width: 100%;
        height: 60vh;
        border: 3px solid #181717;
        border-radius: 10px;
        cursor: pointer;
    }

    .banned {
        border-color: #e63632;
    }

    .banned .headline {
        background-color: #e63632;
    }

    .picked {
        border-color: #45b584;
    }

    .picked .headline {
        background-color: #45b584;
    }

    .background {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: var(--image);
        background-size: cover;
        background-position-x: center;
        background-position-y: center;
        z-index: -1;
    }

    .headline {
        height: 5vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #181717;
        transition: background-color 0.4s ease;
    }

    .card :global(#overlay-icon) {
        position: absolute;
        width: 30%;
        max-height: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }


    p {
        margin: 0;
        padding: 0;
        text-align: center;
        font-size: 4ex;
        color: white;
    }

</style>
