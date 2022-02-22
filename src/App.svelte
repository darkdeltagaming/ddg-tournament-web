<script>
	import Background from './Background.svelte'
	import Header from "./Header.svelte";
	import Maps from "./maps/Maps.svelte";
	import TeamAnnouncement from "./teams/TeamAnnouncement.svelte";
    import Leaderboard from "./leaderboard/Leaderboard.svelte";

	let backgroundIMG = "csgo.png";

    let eventSource = new EventSource('http://127.0.0.1:5500/events');

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("uid");
    // const auth = urlParams.get("auth");
    // maybe not needed at all

	let match_nr = 1;
	let state = 1;
    let error_msg = "No errors occoured";

    if (userId == null) {
        state = -1;
        error_msg = "No userId was provided by URL query parameter. Be sure to use the link sent by the Tournament Steambot. If you think this is a bug contact NoRysq#8480 on Discord or @michihupf on GitHub.";
    }

	let ct = ["NoRysq", "DanL"];
	let t =  ["Læffy", "m1k3"];

	let state_name = getStateName();

	function getStateName() {
		switch (state) {
            case -1:
                return "An error occoured";
			case 0:
				return "Announce Team";
			case 1:
				return "Ban Map";
			case 2:
				return "Leaderboard";
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

    // Event Handler for sending API Requests from within Components
    // function requestAPIHandler();

</script>
<Background image={backgroundIMG}/>
<Header match_nr={match_nr} state_name={state_name}/>

{#if state === -1}
    <div class="error">
        <h1>An error has occoured</h1>
        <p>{error_msg}</p>
    </div>
{/if}
{#if state === 0}
    <div on:load={nextState(8000)}></div>
    <TeamAnnouncement ct={ct} t={t}/>
{/if}
{#if state === 1}
    <Maps on:changeBackground={handleChangeBackground} userId={userId} sse={eventSource}/>
{/if}
{#if state === 2}
    <Leaderboard/>
{/if}

<style>
    .error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        opacity: 0.8;
        border-radius: 15px;
        padding: 10px 30px;
        text-align: center;
        max-width: 40%;
    }
</style>
