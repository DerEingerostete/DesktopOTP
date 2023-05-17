<script setup lang="ts">
import {ref, watch} from "vue";
import {AegisSetup, PasswordSetup} from "../../assets/js/SetupClasses";
import ValidateTokenComponent from "../token/ValidateTokenComponent.vue";
import {QList} from "quasar";

const props = defineProps<{
    password: PasswordSetup,
    aegisSetup: AegisSetup
}>();

const isPassword = ref(true);
const itemRef = ref(null);

watch(itemRef, () => {
    if (props.aegisSetup.imported.size >= 0) {
        let itemElement: HTMLElement = document.getElementById("item-list");
        itemElement.style.display = "none";
    }
})
</script>

<template>
    Please take a moment to review all provided information for accuracy before proceeding to finalize the setup process by clicking the 'Finish' button.
    <q-input class="password-entry" standout v-model="password.password" filled readonly
             :type="isPassword ? 'password' : 'text'" label="Password"
             lazy-rules
    >
        <template v-slot:append>
            <q-icon
                    :name="isPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPassword = !isPassword"
            />
        </template>
    </q-input>
    <q-checkbox class="checkbox-entry" v-model="aegisSetup.deleteOnFinish" disable label="Delete Aegis file after import (recommended)" />
    <br>
    Importing from Aegis:
    <div class="list">
        <q-scroll-area class="scroll-area">
            <!--suppress VueUnrecognizedDirective -->
            <q-item v-ripple id="item-list" ref="itemRef">
                <q-item-section>
                    <q-item-label>Nothing will be imported</q-item-label>
                    <q-item-label caption>No Aegis file was selected</q-item-label>
                </q-item-section>
            </q-item>
            <q-list bordered separator>
                <ValidateTokenComponent
                        v-for="entry in aegisSetup.imported.keys()"
                        :token-entry="entry"
                        :import-map="aegisSetup.imported"
                />
            </q-list>
        </q-scroll-area>
    </div>
</template>

<style scoped>
.password-entry {
    width: 75vw;
    padding-top: 0.75vh;
    padding-bottom: 1.75vh;
}

.checkbox-entry {
    padding-bottom: 1.5vh;
}

.list {
    padding-top: 0.75vh;
}

.scroll-area {
    height: 35vh;
    max-width: 75vw;
}
</style>