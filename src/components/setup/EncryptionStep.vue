<script setup lang="ts">
import {ref, watch} from "vue";
import {QInput} from "quasar";
import {
    CryptoOptions,
    ENCRYPTION_ALGORITHMS,
    getRandomAPINames,
    getRandomAPIShortName,
    HASHING_ALGORITHMS
} from "../../assets/js/crypto/CryptoClasses";

const props = defineProps<{
    options: CryptoOptions,
}>();

const encryptionOptions = ref(ENCRYPTION_ALGORITHMS);
const encryptionModel = ref(props.options.encryptionAlgorithm.toUpperCase());

const hashingModel = ref(props.options.hashAlgorithm.toUpperCase());
const hashingOptions = ref(HASHING_ALGORITHMS);

const randomOptions = ref(getRandomAPINames());
const randomModel = ref(props.options.randomAPIName);

const apiKey = ref(props.options.apiKey);
const hideAPIKey = ref(true);
const requireAPIKey = ref(props.options.randomAPIName === "NodeJS Crypto (Offline)");

watch(randomModel, (newValue) => props.options.randomAPIName = getRandomAPIShortName(newValue));
watch(randomModel, (newValue) => requireAPIKey.value = newValue === "NodeJS Crypto (Offline)");

watch(apiKey, (newValue) => props.options.apiKey = newValue);
watch(encryptionModel, (newValue) => props.options.encryptionAlgorithm = newValue.toLowerCase());
watch(hashingModel, (newValue) => props.options.hashAlgorithm = newValue.toLowerCase());
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
</template>

<style scoped>
.padding {
    padding-top: 1vh;
}
</style>