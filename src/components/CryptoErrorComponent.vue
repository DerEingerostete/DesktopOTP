<script setup lang="ts">
import {openGitHubPage} from "../assets/js/ElectronUtils";
import {useDialogPluginComponent} from "quasar";
import {ipcRenderer} from "electron";

defineEmits([
    ...useDialogPluginComponent.emits
])

const { dialogRef } = useDialogPluginComponent();
function onDialogHide () {
    ipcRenderer.send('exit-app');
}

function handleClick() {
    openGitHubPage("issues");
}
</script>

<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" class="blur-bg">
        <q-card class="q-dialog-plugin">
            <div class="dialog" style="color: #ced4da;">
                <h2 style="color: #d90429;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Failed to load encryption information
                </h2>

                <p>
                    Please try restarting DesktopOTP.
                    <br>If this error persists, please create an issue on <a @click="handleClick">GitHub</a>
                    <br><br>
                    <b>Important:</b> When creating an issue, please ensure that you upload your log file without including any personal information.
                </p>
            </div>
        </q-card>
    </q-dialog>
</template>

<style scoped>
.dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;

    background-color: #212529;
    max-width: 45vw;
    max-height: 35vh;
    padding: 2rem 3rem 1rem;
}

h2 {
    font-weight: 600;
    font-size: 2rem;
}

p {
    font-size: 1.02rem;
    line-height: 1.3rem;
    padding: 0.5rem 0;
}

a {
    color: #52b788;
    text-decoration: underline;
    cursor: pointer;
}

a:hover {
    color: #2d6a4f;
}

.blur-bg {
    z-index: 0;
    backdrop-filter: blur(5px);
}
</style>