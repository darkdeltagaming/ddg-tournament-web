<script>
    import { fade } from 'svelte/transition';
    export let image = "/img/csgo.png";
    let displayed = image;
    let blacken = false;

    $: cross(image)

    function cross(_) {
        blacken = true;
        setTimeout(() => {
            displayed = image;
            setTimeout(() => {
                blacken = false;
            }, 200);
        }, 200);
    }
</script>

<div class="bg-container">
    {#if !blacken}
        <div transition:fade={{ duration: 200}}>
            <img class="background" src="{displayed}" alt="background"/>
        </div>
    {/if}
</div>

<style>
    .bg-container{
    	position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		overflow: hidden;
        background: none;
	}

    .blacken {
        background: #181717;
    }
	
	.background {
		position: absolute;
		top: -15px;
		left: -15px;
		bottom: -15px;
		right: -15px;
		filter: blur(4px);
	}
</style>
