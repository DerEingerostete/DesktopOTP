<script setup lang="ts">
import {Token} from "../../assets/js/token/Token";
import {ref} from "vue";
import {ProfileGenerator} from "../../assets/js/ProfileGenerator";

const props = defineProps<{
    tokenEntry: Token
}>();

const imageSrc = ref(ProfileGenerator.getImageData(props.tokenEntry));
let progress = ref(0.6);
</script>

<template>
<div class="tokenDiv">
    <q-linear-progress :value="progress" class="q-mt-md progressBar" />
    <img class="icon" :src="imageSrc" alt="Profile Image"/>
    <div class="textDiv">
        <p class="title">{{tokenEntry.issuer}}</p>
        <p class="token">987 456</p>
    </div>
</div>
</template>

<style scoped>
.tokenDiv {
    width: 100vw;
    height: 100px;
    max-height: 100px;

    display: flex;
    align-items: center;
}

.textDiv {
    padding-left: 1vw;
}

.icon {
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

.title {
    font-weight: bold;
}

.token {
    color: #adb5bd;
}
</style>