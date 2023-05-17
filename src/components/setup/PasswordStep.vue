<script setup lang="ts">
import {ref, watch} from "vue";
import {PasswordSetup} from "../../assets/js/SetupClasses";
import {QInput} from "quasar";

const props = defineProps<{
    setup: PasswordSetup,
}>();

const minPasswordLength = ref(8);
const password = ref(props.setup.password);
const repeatPassword = ref(props.setup.password);
const advancedOptionsEnabled = ref(!props.setup.encryptionOptionsDisabled);

const firstIsPassword = ref(true);
const secondIsPassword = ref(true);
const secondPasswordInput = ref(null);

watch(advancedOptionsEnabled, newValue => props.setup.encryptionOptionsDisabled = !newValue)
watch(password, () => onPasswordType());
watch(repeatPassword, () => onPasswordType());
function onPasswordType(): void {
    props.setup.password = password.value;
    let passwordSame: boolean = password.value === repeatPassword.value;
    props.setup.nextDisabled = !(passwordSame && password.value.length >= minPasswordLength.value);
    (secondPasswordInput.value as QInput).validate();
}
</script>

<template>
    Please create a unique and secure password to safeguard all of your 2FA tokens from potential theft.<br>
    This password is utilized to encrypt all data and should be kept in a secure location. In the event that the password is lost, it will not be possible to retrieve any data.
    <div class="passwords items-center">
        <q-input class="password-entry" standout v-model="password" filled
                 :type="firstIsPassword ? 'password' : 'text'" label="Enter Password"
                 :rules="[
                     val => !!val || 'Required',
                     val => val.length >= minPasswordLength || `Password must be at least ${minPasswordLength} characters long`
                 ]"
                 lazy-rules
        >
            <template v-slot:append>
                <q-icon
                        :name="firstIsPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="firstIsPassword = !firstIsPassword"
                />
            </template>
        </q-input>
        <q-input class="password-entry" standout v-model="repeatPassword" filled
                 :type="secondIsPassword ? 'password' : 'text'" label="Repeat Password"
                 :rules="[
                     val => !!val || 'Required',
                     val => val.length >= minPasswordLength || `Password must be at least ${minPasswordLength} characters long`,
                     val => val === password || 'Passwords do not match'
                 ]"
                 lazy-rules
                 ref="secondPasswordInput"
        >
            <template v-slot:append>
                <q-icon
                        :name="secondIsPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="secondIsPassword = !secondIsPassword"
                />
            </template>
        </q-input>

        <q-checkbox class="checkbox-entry" v-model="advancedOptionsEnabled" label="Enable encryption options (not recommended)" />
    </div>
</template>

<style scoped>
.passwords {
    width: 75vw;
    padding-top: 2vh;
}

.password-entry {
    padding-bottom: 1vh;
}

.checkbox-entry {
    padding-top: 1.3vh;
}
</style>