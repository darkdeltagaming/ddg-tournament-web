<script>
	let match_nr = 1;
	let state_name = "Ban Maps";

	import Header from "./Header.svelte"
	import Maps from "./Maps.svelte"
</script>

<Header match_nr={match_nr} state_name={state_name}/>
{#if state_name === "Ban Maps"}
<Maps/>
{/if}