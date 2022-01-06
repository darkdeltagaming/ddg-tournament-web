<script>
	import Header from "./Header.svelte"
	import Maps from "./maps/Maps.svelte"
	import TeamAnnouncement from "./teams/TeamAnnouncement.svelte"

	import { fade } from 'svelte/transition'

	let match_nr = 1;
	let state = 0;
	let state_name = getStateName();

	function getStateName() {
		switch (state) {
			case 0:
				return "Announce Team";
			case 1:
				return "Ban Map";
			default:
				return "";
		}
	}

	function nextState(delay) {
		setTimeout(() => {
			state++;
			state_name = getStateName();
		}, delay);
	}
</script>

<Header match_nr={match_nr} state_name={state_name}/>

{#if state === 0}
<div on:load={nextState(8000)}></div>
<TeamAnnouncement/>
{/if}
{#if state === 1}
<Maps/>
{/if}