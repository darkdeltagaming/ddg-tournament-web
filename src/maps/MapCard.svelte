<script>
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    export let map_name;

    const dispatch = createEventDispatcher();

    export let banned = false;
    export let picked = false;

    function dispatchBan() {
        dispatch('ban', { name: map_name });
    }

    export function pickMap() {
        picked = true;
    }

</script>

<div class="card {banned ? 'banned' : picked ? 'picked' : ''}" style="--image: url(/img/{map_name}.png);" on:click={dispatchBan}>
    <div class="background"></div>
    {#if banned}
        <svg id="overlay-icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
        viewBox="0 0 172 172"
        style=" fill:#000000;" in:fade><g transform="translate(7.396,7.396) scale(0.914,0.914)"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="none" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g fill="#e63632" stroke="#e63632" stroke-width="16" stroke-linejoin="round"><path d="M146.81031,25.18969c16.24253,16.24259 25.18969,37.84057 25.18969,60.81031c0,22.96974 -8.9471,44.56778 -25.18969,60.81031c-16.24259,16.24253 -37.83776,25.18969 -60.81031,25.18969c-22.97255,0 -44.56778,-8.9471 -60.81031,-25.18969c-16.24253,-16.24259 -25.18969,-37.84057 -25.18969,-60.81031c0,-22.96974 8.9471,-44.56778 25.18969,-60.81031c16.24259,-16.24253 37.83776,-25.18969 60.81031,-25.18969c22.97255,0 44.56778,8.9471 60.81031,25.18969zM86,160.53333c17.98283,0 34.95676,-6.37615 48.45234,-17.97371l-105.01127,-105.01127c-11.59578,13.4977 -17.9744,30.47163 -17.9744,48.45165c0,19.90711 7.75456,38.62443 21.83035,52.70298c14.07579,14.0786 32.79306,21.83035 52.70298,21.83035zM160.53333,86c0,-19.90711 -7.75456,-38.62438 -21.83035,-52.70298c-14.07579,-14.0786 -32.79306,-21.83035 -52.70298,-21.83035c-17.98283,0 -34.95676,6.37615 -48.45234,17.97371l105.01127,105.01127c11.59578,-13.4977 17.9744,-30.47163 17.9744,-48.45165z"></path></g><path d="M0,172v-172h172v172z" fill="none" stroke="none" stroke-width="1" stroke-linejoin="miter"></path><g fill="#e63632" stroke="none" stroke-width="1" stroke-linejoin="miter"><path d="M86,0c-22.97255,0 -44.56772,8.94715 -60.81031,25.18969c-16.24259,16.24253 -25.18969,37.84057 -25.18969,60.81031c0,22.96974 8.94715,44.56772 25.18969,60.81031c16.24253,16.24259 37.83776,25.18969 60.81031,25.18969c22.97255,0 44.56772,-8.94715 60.81031,-25.18969c16.24259,-16.24253 25.18969,-37.84057 25.18969,-60.81031c0,-22.96974 -8.94715,-44.56772 -25.18969,-60.81031c-16.24253,-16.24259 -37.83776,-25.18969 -60.81031,-25.18969zM33.29702,138.70298c-14.07579,-14.07854 -21.83035,-32.79587 -21.83035,-52.70298c0,-17.98002 6.37862,-34.95395 17.9744,-48.45165l105.01127,105.01127c-13.49558,11.59756 -30.46951,17.97371 -48.45234,17.97371c-19.90992,0 -38.62719,-7.75175 -52.70298,-21.83035zM142.55893,134.45165l-105.01127,-105.01127c13.49558,-11.59756 30.46951,-17.97371 48.45234,-17.97371c19.90992,0 38.62719,7.75175 52.70298,21.83035c14.07579,14.0786 21.83035,32.79587 21.83035,52.70298c0,17.98002 -6.37862,34.95395 -17.9744,48.45165z"></path></g><path d="" fill="none" stroke="none" stroke-width="1" stroke-linejoin="miter"></path><path d="" fill="none" stroke="none" stroke-width="1" stroke-linejoin="miter"></path></g></g></svg>
    {/if}
    {#if picked}
        <svg id="overlay-icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
        viewBox="0 0 172 172"
        style=" fill:#000000;" in:fade><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g fill="#45b584"><path d="M69.56683,137.03383c-1.34017,1.34733 -3.16767,2.09983 -5.06683,2.09983c-1.89917,0 -3.72667,-0.7525 -5.06683,-2.09983l-40.463,-40.47017c-4.19967,-4.19967 -4.19967,-11.008 0,-15.2005l5.06683,-5.06683c4.19967,-4.19967 11.00083,-4.19967 15.2005,0l25.2625,25.2625l68.2625,-68.2625c4.19967,-4.19967 11.008,-4.19967 15.2005,0l5.06683,5.06683c4.19967,4.19967 4.19967,11.008 0,15.2005z"></path></g></g></svg>
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

    #overlay-icon {
        position: absolute;
        width: 30%;
        max-height: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .headline {
        height: 5vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #181717;
        transition: background-color 0.4s ease;
    }

    p {
        margin: 0;
        padding: 0;
        text-align: center;
        font-size: 4ex;
        color: white;
    }

</style>