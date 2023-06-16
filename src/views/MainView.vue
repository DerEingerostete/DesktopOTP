<script setup lang="ts">
import {ref} from "vue";
import {TOKENS} from "../assets/js/Constants";
import TokenComponent from "../components/token/TokenComponent.vue";
import {TokenUtils} from "../assets/js/token/TokenUtils";

const tokenList = ref(TOKENS);
const progress = ref(1);
const period: number = TokenUtils.getMostFrequentPeriod(tokenList.value);
const multipliedPeriod: number = period * 1000;

update();
function update() {
    progress.value = TokenUtils.getMillisTillNextRotation(period) / multipliedPeriod;
    setTimeout(() => update(), 500);
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