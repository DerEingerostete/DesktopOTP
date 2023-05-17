<script setup lang="ts">
import {ref} from "vue";
import {CONFIG_DIRECTORY_PATH, STORAGE_FILE_NAME} from "../assets/js/ConfigLoader";
import {router} from "../main";

const fileSystem = require("fs");

const props = defineProps({
    action: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: "Loading"
    },
});

const text = ref(props.message + "...");
let dots : number = 3;
animateText();
loadAsync();

async function loadAsync() {
    if (props.action === "startup") loadStartup();
}

function loadStartup() {
    let path = CONFIG_DIRECTORY_PATH + "/" + STORAGE_FILE_NAME;
    if (fileSystem.existsSync(path)) router.push('/login');
    else router.push('/setup');
}

async function animateText() {
    if (dots >= 3) dots = 0;
    else dots++;
    text.value = props.message + ".".repeat(dots);
    setTimeout(() => animateText(), 750);
}
</script>

<template>
    <div class="flex items-center justify-center h-screen">
        <div class="orbit-spinner">
            <div class="orbit"></div>
            <div class="orbit"></div>
            <div class="orbit"></div>
        </div>
        <h1 class="align-top text-6xl padding">{{ text }}</h1>
    </div>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.padding {
    padding-left: 1vw;
}

@media (max-width: 600px) {
    .orbit-spinner {
        height: 10vw !important;
        width: 10vw !important;
    }
}

.orbit-spinner, .orbit-spinner * {
    box-sizing: border-box;
}

.orbit-spinner {
    height: 20vh;
    width: 20vh;
    border-radius: 50%;
    perspective: 800px;
}

.orbit-spinner .orbit {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.orbit-spinner .orbit:nth-child(1) {
    left: 0;
    top: 0;
    animation: orbit-spinner-orbit-one-animation 1200ms linear infinite;
    border-bottom: 3px solid #ff1d5e;
}

.orbit-spinner .orbit:nth-child(2) {
    right: 0;
    top: 0;
    animation: orbit-spinner-orbit-two-animation 1200ms linear infinite;
    border-right: 3px solid #ff1d5e;
}

.orbit-spinner .orbit:nth-child(3) {
    right: 0;
    bottom: 0;
    animation: orbit-spinner-orbit-three-animation 1200ms linear infinite;
    border-top: 3px solid #ff1d5e;
}

@keyframes orbit-spinner-orbit-one-animation {
    0% {
        transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
    }
    100% {
        transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
    }
}

@keyframes orbit-spinner-orbit-two-animation {
    0% {
        transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
    }
    100% {
        transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
    }
}

@keyframes orbit-spinner-orbit-three-animation {
    0% {
        transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
    }
    100% {
        transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
    }
}
</style>