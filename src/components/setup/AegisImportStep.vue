<script setup lang="ts">
import {ref, watch} from "vue";
import {useQuasar} from "quasar";
import {AegisSetup} from "../../assets/js/SetupClasses";

const $q = useQuasar();

const props = defineProps<{
    setup: AegisSetup,
}>();

const deleteOnFinish = ref(props.setup.deleteOnFinish);
watch(deleteOnFinish, newValue => props.setup.deleteOnFinish = newValue);

const model = ref(null);
watch(model, newValue => props.setup.file = newValue);

function checkFileType(files) {
    return files.filter(file => file.type === 'application/json');
}

function onRejected () {
    $q.notify({
        type: 'negative',
        message: 'The file must be a JSON file (.json)'
    })
}
</script>

<template>
    Optionally, you can import your tokens from Aegis by exporting your Aegis vault as a JSON file and selecting it.<br>
    <b>Note: The JSON file must be decrypted.</b> To do so, please ensure that the checkbox "Encrypt the vault" is unselected while exporting your Vault in the app.
    <q-file class="file-selector" filled bottom-slots v-model="model" label="Select Aegis file" :filter="checkFileType" @rejected="onRejected">
        <template v-slot:prepend>
            <q-icon name="attachment" @click.stop.prevent />
        </template>
        <template v-slot:append>
            <q-icon name="close" @click.stop.prevent="model = null" class="cursor-pointer" />
        </template>
    </q-file>
    <q-checkbox v-model="deleteOnFinish" label="Delete Aegis file after import (recommended)" />
</template>

<style scoped>
.file-selector {
    padding-top: 1rem;
}
</style>