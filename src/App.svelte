<script>
	import Background from './Background.svelte'
	import Header from "./Header.svelte";
	import Maps from "./maps/Maps.svelte";
	import TeamAnnouncement from "./teams/TeamAnnouncement.svelte";
    import Leaderboard from "./leaderboard/Leaderboard.svelte";
    import Verification from "./Verification.svelte";

	let backgroundIMG = "csgo.png";

	let match_nr = 1;
	let state = 99;
	let state_name = getStateName();

	let ct = ["NoRysq", "DanL"];
	let t =  ["Læffy", "m1k3"];

	function getStateName() {
		switch (state) {
			case 0:
				return "Announce Team";
			case 1:
				return "Ban Map";
			case 2:
				return "Leaderboard";
            case 99:
                return "Verify Identity";
			default:
				return "";
		}
	}

	function handleChangeBackground(event) {
		setTimeout(() => {
			backgroundIMG = event.detail.img;
		}, 500);
		nextState(3000);
	}

	function nextState(delay) {
		setTimeout(() => {
			state++;
			state_name = getStateName();
		}, delay);
	}
</script>
<Background image={backgroundIMG}/>
<Header match_nr={match_nr} state_name={state_name}/>

{#if state === 0}
    <div on:load={nextState(8000)}></div>
    <TeamAnnouncement ct={ct} t={t}/>
{/if}
{#if state === 1}
    <Maps on:changeBackground={handleChangeBackground}/>
{/if}
{#if state === 2}
    <Leaderboard/>
{/if}
{#if state == 99}
   <Verification/> 
{/if}

<style>

</style>
