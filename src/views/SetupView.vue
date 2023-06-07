<script setup lang="ts">
import {ref} from "vue";
import PasswordStep from "../components/setup/PasswordStep.vue";
import ValidationStep from "../components/setup/ValidationStep.vue";
import AegisImportStep from "../components/setup/AegisImportStep.vue";
import {AegisSetup, finishSetup, PasswordSetup} from "../assets/js/SetupClasses";
import {QStepper} from "quasar";
import {router} from "../main";
import EncryptionStep from "../components/setup/EncryptionStep.vue";

const step = ref(1);
const passwordSetup = ref(new PasswordSetup());
const aegisSetup = ref(new AegisSetup(null));
const stepper = ref(null);

async function handleNext() {
    if (step.value === 3) {
        console.log("Importing Aegis");
        aegisSetup.value.importAegis().then(success => {
            if (success) (stepper.value as QStepper).next();
        });
    } else if (step.value === 4) {
        finishSetup(passwordSetup.value, aegisSetup.value).then((success) => {
            if (success) router.push('/main');
        });
    } else {
        (stepper.value as QStepper).next();
    }
}
</script>

<template>
    <div class="grid grid-rows-1 place-content-center">
        <div class="gap-0 text-center pt-2">
            <h1 class="main-header">Welcome</h1>
            <hr class="horizontal">
            <p class="info-text">Welcome to DesktopOTP. A simple tool to generate 2FA codes for you on your desktop.</p>
        </div>
    </div>

    <div class="q-pa-md vertical">
        <q-stepper
                class="width"
                v-model="step"
                ref="stepper"
                color="primary"
                active-icon="none"
                animated
        >

            <q-step
                    :name="1"
                    title="Configure Password"
                    icon="fa-solid fa-key"
                    :done="step > 1"
            >
                <PasswordStep :setup="passwordSetup"></PasswordStep>
            </q-step>

            <q-step
                    :name="2"
                    title="Encryption Settings"
                    :caption="passwordSetup.encryptionOptionsDisabled ? 'Optional × Disabled' : 'Optional × Enabled'"
                    icon="fa-solid fa-lock"
                    :done="step > 2"
                    :disable="passwordSetup.encryptionOptionsDisabled"
            >
                <EncryptionStep/>
            </q-step>

            <q-step
                    :name="3"
                    title="Import from Aegis"
                    caption="Optional"
                    icon="fa-solid fa-file-import"
                    :done="step > 3"
            >
                <AegisImportStep :setup="aegisSetup"></AegisImportStep>
            </q-step>

            <q-step
                    :name="4"
                    title="Validate"
                    icon="fa-solid fa-magnifying-glass"
                    :done="step > 4"
            >
                <ValidationStep :password="passwordSetup" :aegis-setup="aegisSetup"></ValidationStep>
            </q-step>

            <template v-slot:navigation>
                <q-stepper-navigation>
                    <q-btn class="button-padding" :disable="passwordSetup.nextDisabled" @click="handleNext()" color="primary" :label="step === 4 ? 'Finish' : 'Continue'" />

                    <!--suppress TypeScriptUnresolvedReference -->
                    <q-btn class="q-ml-sm button-padding" v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back" />
                </q-stepper-navigation>
            </template>
        </q-stepper>
    </div>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

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
    width: 23rem;
    margin: auto;
}

.button-padding {
    padding: 0.3vh 0.8vw;
}

.vertical {
    display: flex;
    align-items: center;
    justify-content: center;
}

.width {
    width: 98vw;
}
</style>