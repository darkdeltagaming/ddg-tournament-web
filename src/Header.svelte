<script>
    export let match_nr;
    export let state_name;
</script>

<div class="head">
    <h1>MATCH #{match_nr}</h1>
    <img src="/favicon.png" alt="Dark Delta Gaming" class="logo">
    <h1>{state_name.toUpperCase()}</h1>
</div>

<style>
    .head {
        width: 100vw;
        height: 10vh;
        position: relative;
        display: flex;
        justify-content: left;
        align-items: center;
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