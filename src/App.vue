<script setup lang="ts">

import {useQuasar} from "quasar";

console.log("[App.vue]", `Started Electron ${process.versions.electron}!`);

const $q = useQuasar();
$q.dark.set(true);
</script>

<template>
    <router-view></router-view>
</template>

<style>

</style>