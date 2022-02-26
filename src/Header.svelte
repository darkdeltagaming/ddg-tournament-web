<script>
    import { fade } from 'svelte/transition'

    export let message;
    export let state_name;
</script>

<div class="head">
    <h1>{message}</h1>
    <img src="/favicon.png" alt="Dark Delta Gaming" class="logo">
    {#key state_name}
        <h1 in:fade={{ delay: 800 }} out:fade>{state_name.toUpperCase()}</h1>
    {/key}
</div>

<style>
    .head {
        width: 100vw;
        height: 10vh;
        position: relative;
        display: flex;
        justify-content: left;
        align-items: center;
        background: #18171799;
    }

    h1 {
        margin: 0;
        padding: 0 4rem;
        color: #d4d4d4;
    }

    .logo {
        width: 4vw;
    }
</style>
