<script>
    import { createEventDispatcher } from 'svelte';
    let verificationCode = 0;
    
    const dispatch = createEventDispatcher();

    const onSubmit = () => {
        if (verificationCode > 99999 && verificationCode < 1000000) {
            console.log(verificationCode);
            dispatch('verified', {
                steamAuth: "STEAM_1:1:BLAAAAH"
            });
        }
    }
</script>

<div class="verification">
    <form on:submit|preventDefault={onSubmit}>
        <label for="field">We sent you a 6-digit verification code on CS:GO. Please enter it here.</label>
        <input class="field" type="text" pattern="[0-9][0-9][0-9][0-9][0-9][0-9]" placeholder="Verification Code" min="6" maxlength="6" max="6" bind:value={verificationCode} required>
        <input class="btn" type="submit">
    </form>
</div>

<style>
    .verification {
        display: flex;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        justify-content: center;
        align-items: center;
    }

    form {
        display: grid;
        justify-items: center;
        align-items: center;
        background: #181717bb;
        width: 30%;
        height: 20%;
        border-radius: 10px;
    }

    label {
        width: 80%;
        text-align: center;
        color: white;
        font-size: 20px;
    }

    .field {
        position: relative;
        height: fit-content;
        font-size: 22px;
        color: white;
        text-align: center;
        background: transparent;
        outline: none;
        border: none;
        border-bottom: 4px solid white;
        border-radius: 0;
        width: 50%;
    }

    .field:focus {
        outline: none;
        border-bottom: 4px solid #fd001c;
    }

    .field:valid {
        border-bottom: 4px solid limegreen;
    }
</style>
