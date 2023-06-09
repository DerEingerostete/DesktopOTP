<script setup lang="ts">
import {ref} from "vue";
import {useQuasar} from "quasar";
import {decrypt} from "../assets/js/crypto/CryptoUtils";
import {CRYPTO_OPTIONS, TOKENS} from "../assets/js/Constants";
import {router} from "../main";
import {Token} from "../assets/js/token/Token";

const $q = useQuasar();

const password = ref("");
const showPassword = ref(true);

function unlock() {
    let passwordValue = password.value;
    if (passwordValue.length === 0) {
        $q.notify({
            type: 'negative',
            message: 'No password was entered!',
            position: "top",
            icon: "fa-solid fa-circle-exclamation"
        });
        return;
    }

    try {
        let decrypted: any[] = decrypt(password.value, CRYPTO_OPTIONS);
        for (const tokenJson of decrypted) {
            let token: Token = Token.fromJson(tokenJson);
            TOKENS.push(token);
        }

        router.push('/main');
    } catch (error) {
        console.log("Failed to unlock", error);
        $q.notify({
            type: 'negative',
            message: 'The decryption of the vault failed. It is possible that an incorrect password was used.',
            position: "top",
            icon: "fa-solid fa-square-xmark"
        });
    }
}
</script>

<template>
    <div class="grid grid-rows-1 place-content-center top-padding">
        <div class="gap-0 text-center pt-2">
            <h1 class="main-header">Welcome back</h1>
            <hr class="horizontal">
            <p class="info-text">Please enter your password to unlock the Vault</p>
        </div>

        <q-input rounded outlined
                 v-model="password"
                 class="input"
                 label="Enter Password"
                 :type="showPassword ? 'password' : 'text'"
                 v-on:keyup.enter="unlock"
        >
            <template v-slot:append>
                <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                />
            </template>
        </q-input>
        <q-btn rounded class="button" icon="fa-solid fa-lock-open" color="primary" label="Unlock" @click="unlock" />
    </div>
</template>

<style scoped>
.top-padding {
    padding-top: 6vh;
}

.main-header {
    font-size: 4rem;
    line-height: 3.5rem;
}

.info-text {
    font-size: 1.2rem;
    padding-top: 1.7vh;
}

.horizontal {
    opacity: 20%;
    border: none;
    height: 0.4vh;
    background-color: whitesmoke;
    width: 26rem;
    margin: auto;
}

.input {
    padding-top: 2vh;
    padding-bottom: 1.5vh;
}

.button {
    height: 5vh;
}
</style>