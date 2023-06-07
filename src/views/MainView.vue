<script setup lang="ts">
import {ref} from "vue";
import TokenComponent from "../components/token/TokenComponent.vue";
import {TOKENS} from "../assets/js/Constants";

const tokenList = ref(TOKENS);
let progress = ref(1);

update();
function update() {
    progress.value -= 0.01;
    if (progress.value <= 0) {
        progress.value = 1;
        setTimeout(() => update(), 2500);
    } else {
        setTimeout(() => update(), 250);
    }
}
</script>

<template>
    <q-toolbar class="text-primary toolbar">
        <q-btn flat round dense icon="menu" />
        <q-toolbar-title>
            Toolbar
        </q-toolbar-title>
        <q-btn flat round dense icon="more_vert" />
    </q-toolbar>
    <q-linear-progress :value="progress" rounded />
    <q-virtual-scroll
        class="scroll"
        :items="tokenList"
        separator
        v-slot="{ item, index }"
    >
        <q-item
            :key="index"
            dense
        >
            <q-item-section>
                <TokenComponent :token-entry="item"/>
            </q-item-section>
        </q-item>
    </q-virtual-scroll>
</template>

<style scoped>
.toolbar {
    height: 10vh;
}

.scroll {
    height: 90vh;
    color-scheme: dark;
}
</style>