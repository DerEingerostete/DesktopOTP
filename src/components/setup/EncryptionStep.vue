<script setup lang="ts">
import {ref, watch} from "vue";
import {QInput} from "quasar";
import {
    ENCRYPTION_ALGORITHMS,
    fromShortName,
    getRandomAPI,
    getRandomAPINames,
    HASHING_ALGORITHMS
} from "../../assets/js/crypto/CryptoClasses";
import {CRYPTO_OPTIONS} from "../../assets/js/Constants";

const encryptionOptions = ref(ENCRYPTION_ALGORITHMS);
const encryptionModel = ref(CRYPTO_OPTIONS.encryptionAlgorithm.toUpperCase());

const hashingModel = ref(CRYPTO_OPTIONS.hashAlgorithm.toUpperCase());
const hashingOptions = ref(HASHING_ALGORITHMS);

const randomOptions = ref(getRandomAPINames());
const randomModel = ref(fromShortName(CRYPTO_OPTIONS.api.getName()));

const apiKey = ref(CRYPTO_OPTIONS.apiKey);
const hideAPIKey = ref(true);
const requireAPIKey = ref(CRYPTO_OPTIONS.api.getName() === "crypto");

watch(randomModel, (newValue) => CRYPTO_OPTIONS.api = getRandomAPI(newValue));
watch(randomModel, (newValue) => requireAPIKey.value = newValue === "NodeJS Crypto (Offline)");

watch(apiKey, (newValue) => CRYPTO_OPTIONS.apiKey = newValue);
watch(encryptionModel, (newValue) => CRYPTO_OPTIONS.encryptionAlgorithm = newValue.toLowerCase());
watch(hashingModel, (newValue) => CRYPTO_OPTIONS.hashAlgorithm = newValue.toLowerCase());
</script>

<template>
    Optionally, you can modify encryption-specific options.<br>
    <b>Important: Settings are intended for experienced users. Modify with caution if you possess the necessary expertise.</b>

    <q-select class="padding" filled v-model="encryptionModel" :options="encryptionOptions" label="Encryption Algorithm" />

    <q-select class="padding" filled v-model="hashingModel" :options="hashingOptions" label="Digest Algorithm" />

    <q-select class="padding" filled v-model="randomModel" :options="randomOptions" label="Random Number Generator" />

    <q-input class="padding" standout v-model="apiKey" filled :disable="requireAPIKey"
             :type="hideAPIKey ? 'password' : 'text'" label="API Key"
             :rules="[
                val => !!val || !requireAPIKey || 'Required',
             ]"
    >
        <!--suppress VueUnrecognizedSlot -->
        <template v-slot:append>
            <q-icon
                    :name="hideAPIKey ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="hideAPIKey = !hideAPIKey"
            />
        </template>
    </q-input>

    <!--TODO: Add IV and Salt Length options -->
</template>

<style scoped>
.padding {
    padding-top: 1vh;
}
</style>