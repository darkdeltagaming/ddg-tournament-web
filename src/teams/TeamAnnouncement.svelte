<script>
    import { scale } from 'svelte/transition'

    let ct = [
        "NoRysq",
        "DanL"
    ]

    let t = [
        "JackyBreekie",
        "m1k3"
    ]
</script>

<div class="teams" in:scale={{ delay: 600}} out:scale={{ delay: 200}}>
    <div class="team-container">
        <img id="ct-logo" class="logo" src="img/ct-icon.png" alt="CT" width="128">
        <img id="t-logo" class="logo" src="img/t-icon.png" alt="CT" width="128">
        <div class="info CT">
            {#each ct as member, i (member)}
                <h1 transition:scale={{ delay: 1200 + 200 * i}}>{member}</h1>
            {/each}
        </div>
        <div class="info T">
            {#each t as member, i (member)}
            <h1 transition:scale={{ delay: 1900 + 200 * i}}>{member}</h1>
            {/each}
        </div>
    </div>
</div>

<style>
    .teams {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .team-container {
        display: grid;
        background: #18171799;
        border-radius: 20px;
        grid-template-columns: repeat(2, 1fr);
        align-items: center;
        justify-items: center;
        align-content: center;
        width: 60%;
        height: 60%;
    }

    .logo {
        padding: 1em 0;
    }

    .info {
        display: grid;
        justify-items: center;
        align-items: center;
        width: 100%;
        height: 40vh;
        color:#fff;
        font-size: xx-large;
    }
</style>