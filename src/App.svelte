<script>
	import Background from './Background.svelte'
	import Header from "./Header.svelte";
	import Maps from "./maps/Maps.svelte";
	import TeamAnnouncement from "./teams/TeamAnnouncement.svelte";
    import Leaderboard from "./leaderboard/Leaderboard.svelte";
    import { getJson } from './api';

	let backgroundIMG = "/img/csgo.png";

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("uid");

    let eventSource = new EventSource('http://127.0.0.1:5500/events/' + userId);
    // const auth = urlParams.get("auth");
    // maybe not needed at all

    // let matchNr and state get fetched by api
    let message = 'Dark Delta Gaming';
    let match = 0;
    let state = 0;
    let state_name = '';
    let error_msg = "No errors occoured";
    let enableBans = false;

    eventSource.addEventListener('DDG_EVENT_NEWSTATE', event => {
        setTimeout(() => {
            let data = JSON.parse(event.data);
            if (data.state === 1) {
                state = 0;
                setTimeout(() => {
                    state = 1;
                }, 3500);
            } else {
                state = data.state;
            }
            match = data.match;
        }, 1500);
    });

    if (userId == null) {
        error_msg = "No userId was provided by URL query parameter. Be sure to use the link sent by the Tournament Steambot. If you think this is a bug contact NoRysq#8480 on Discord or @michihupf on GitHub.";
        state = -1;
    }

	let ct = ["NoRysq", "DanL"];
	let t =  ["Læffy", "m1k3"];

    $: console.log(state) && setStateName();
    $: message = state === -2 ? 'Dark Delta Gaming' : 'Match #' + (match + 1);

    async function setTournamentInfo() {
        let response = await getJson('http://127.0.0.1:5500/tournament');
        if (response.state === 1) {
            state = 0;
            setTimeout(() => {
                state = 1;
            }, 3500);
        } else
            state = parseInt(response.state);
        match = parseInt(response.match);
        return Promise.resolve();
    }

	function setStateName() {
		switch (state) {
            case -1:
                state_name = 'An error occoured';
                break;
            case 0:
                state_name = 'Team Reveal';
                break;
			case 1:
				state_name = 'Map Pick';
                break;
			case 4:
			    state_name = 'Leaderboard';
                break;
			default:
				state_name = '';
		}
	}

	function handleChangeBackground(event) {
		setTimeout(() => {
			backgroundIMG = event.detail.img;
		}, 500);
	}
</script>

<Background image={backgroundIMG}/>
<Header message={message} state_name={state_name}/>
{#await setTournamentInfo()}
<p>Retriving tournament information</p>
{:then}

{#if state === -1}
    <div class="error">
        <h1>An error has occoured</h1>
        <p>{error_msg}</p>
    </div>
{/if}
{#if state === 0}
    <TeamAnnouncement ct={ct} t={t}/>
{/if}
{#if state === 1}
    <Maps on:changeBackground={handleChangeBackground} userId={userId} 
        sse={eventSource} enableBans={enableBans}/>
{/if}
{#if state === 4}
    <Leaderboard/>
{/if}
{:catch error}
    <div class="error">
        <h1>An error has occoured</h1>
        <p>{error}</p>
    </div>
{/await}

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
