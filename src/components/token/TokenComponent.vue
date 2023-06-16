<script setup lang="ts">
import {Token} from "../../assets/js/token/Token";
import {ref} from "vue";
import {ProfileGenerator} from "../../assets/js/ProfileGenerator";
import {GeneratorsCallback, TokenGenerator, TokenGenerators} from "../../assets/js/token/TokenGenerator";
import {Dialog} from "quasar";

const props = defineProps<{
    tokenEntry: Token
}>();

const generator: TokenGenerator = new TokenGenerator(props.tokenEntry);
const tokenText = ref("");

//References
const displayNames: string[] = props.tokenEntry.getDisplayNames();
const imageSrc = ref(ProfileGenerator.getImageData(props.tokenEntry));
const displayTokenText = ref(generator.hiddenTokenText);
const progress = ref(0.6);

//Hide/Show Button
const hideButtonStyle = ref(true);
function handleHideButton() {
    hideButtonStyle.value = !hideButtonStyle.value;
    if (hideButtonStyle.value) displayTokenText.value = generator.hiddenTokenText;
    else displayTokenText.value = tokenText.value;
}

function handleEditButton() {
    Dialog.create({
        title: '<b style="color: #e63946">Not implemented</b>',
        message: 'The functionality to edit individual tokens is not currently implemented in this version.',
        cancel: false,
        persistent: false,
        html: true
    });
}

const generatorsCallback: GeneratorsCallback = new class implements GeneratorsCallback {
    updateToken(currentMillis: number) {
        tokenText.value = generator.generateToken(currentMillis);
        if (!hideButtonStyle.value) displayTokenText.value = tokenText.value;
    }

}

let period: number | null = props.tokenEntry.secret.period;
if (period !== null) {
    TokenGenerators.addComponent(period, generatorsCallback);
}
</script>

<template>
<div class="main-container">
    <div class="token-container">
        <q-linear-progress :value="progress" class="q-mt-md progressBar" />
        <img class="profile-icon" :src="imageSrc" alt="Profile Image"/>
        <div class="text-container">
            <div class="title-container">
                <p class="title">{{displayNames[0]}}</p>
                <p class="title-second">{{displayNames.length === 2 ? displayNames[1] : ""}}</p>
            </div>
            <p class="token">{{ displayTokenText }}</p>
        </div>
    </div>
    <div class="options-container">
        <i :class="hideButtonStyle ? 'fa-solid fa-eye-slash options-icon' : 'fa-solid fa-eye options-icon'"
           @click="handleHideButton"
           :style="hideButtonStyle ? 'color: #1F4528;' : 'color: #9d0208;'">
            <q-tooltip class="text-body2" :delay="350" :offset="[10, 10]">
                {{ hideButtonStyle ? "Show token" : "Hide token"}}
            </q-tooltip>
        </i>
        <i class="fa-solid fa-pen-to-square options-icon"
        @click="handleEditButton">
            <q-tooltip class="text-body2" :delay="350" :offset="[10, 10]">Edit</q-tooltip>
        </i>
    </div>
</div>
</template>

<style scoped>
.main-container {
    width: 97.2vw;
    height: 100px;
    max-height: 100px;

    display: flex;
    justify-content: space-between;
}

.token-container {
    display: flex;
    align-items: center;
}

.text-container {
    padding-left: 1vw;
}

.profile-icon {
    width: 65px;
    height: 65px;
    margin-left: 0.5vw;
}

.progressBar {
    width: 97vw;
    margin-left: 0.25vw;
    margin-top: 0.3rem;
    display: none;
}

p {
    font-size: 1.4rem;
    margin: 0;
    padding: 0;
}

.token {
    color: #dee2e6;
}

.title-container {
    display: flex;
}

.title {
    font-weight: 500;
}

.title-second {
    padding-left: 0.25rem;
    color: #adb5bd;
}

.options-container {
    padding-right: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.options-icon {
    font-size: 32px;
    color: #495057;
    padding-left: 10px;
}

.options-icon:hover {
    color: #0353a4 !important;
    cursor: pointer;
}
</style>