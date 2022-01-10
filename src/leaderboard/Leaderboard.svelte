<script>
    import { scale } from 'svelte/transition';

    //sorted leaderboard
    export let leaderboard = [
        {
            "name": "NoRysq",
            "points": 39
        },
        {
            "name": "DanL",
            "points": 35
        },
        {
            "name": "Læffy",
            "points": 27
        },
        {
            "name": "m1k3",
            "points": 19
        },
        {
            "name": "JackyBreekie",
            "points": 9
        },
    ]
</script>

<div class="container" in:scale={{ delay: 1000 }} out:scale>
    <div class="leaderboard">
        <h1>LEADERBOARD</h1>
        <div class="content">
            <div class="row title lighter">
                <p>Platz</p>
                <p>Name</p>
                <p>Punkte</p>
            </div>
            {#each leaderboard as item, i}
                <div class="row">
                    <p class="place" style="color: {i == 0 ? 'gold' : i == 1 ? '#8a8a8a' : i == 2 ? 'chocolate' : 'white'}">#{i+1}</p>
                    <p>{item.name}</p>
                    <p>{item.points}</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .leaderboard {
        position: relative;
        display: grid;
        justify-content: center;
        justify-items: center;
        grid-template-rows: auto 1fr;
        grid-auto-columns: 100%;
        width: 60%;
        border-radius: 20px;
        background: #181717bb;
        color: white;
    }

    h1 {
        font-size: 44px;
    }

    .content {
        width: 100%;
        display: grid;
        align-content: center;
    }

    .row {
        display: grid;
        justify-items: center;
        width: 100%;
        grid-template-columns: repeat(3, 1fr);
        font-size: 28px;
    }

    .title {
        background: #d4d4d422;
        font-size: 32px;
    }
</style>
