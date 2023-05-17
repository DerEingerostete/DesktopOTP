<script setup lang="ts">
import {ref, watch} from "vue";
import {Token} from "../../assets/js/token/Token";

const props = defineProps<{
    importMap: Map<Token, boolean>,
    tokenEntry: Token
}>();

const issuer: string = props.tokenEntry.issuer;
const issuerRef = ref(issuer.trim().length === 0 ? "/" : issuer);

const keep = ref(true);
watch(keep, newValue => props.importMap.set(props.tokenEntry, newValue));
</script>

<template>
    <q-item clickable v-ripple>
        <div class="flex flex-row pl-0">
            <div class="center">
                <q-checkbox v-model="keep" />
            </div>
            <div class="info">
                <p class="header">{{ issuerRef }}</p>
                <p>{{ props.tokenEntry.label.accountName }}</p>
            </div>
        </div>
    </q-item>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.center {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-right: 0.1vw;
}

.header {
    font-size: 0.95rem;
    margin-bottom: -0.2vh;
}

.info p {
    margin-top: 0;
}
</style>