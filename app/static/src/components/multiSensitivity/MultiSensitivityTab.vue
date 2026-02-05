<template>
    <div class="multi-sensitivity-tab">
        <div>
            <loading-button
                class="btn btn-primary"
                id="run-multi-sens-btn"
                :loading="running"
                :is-disabled="!canRunMultiSensitivity"
                @click="runMultiSensitivity"
                >Run Multi-sensitivity</loading-button
            >
        </div>
        <action-required-message :message="updateMsg"></action-required-message>
        <div class="multi-sensitivity-status p-4" :class="updateMsg || error ? 'text-muted' : ''">
            {{ multiSensitivityRunStatusMsg }}
        </div>
        <error-info :error="error"></error-info>
        <sensitivity-summary-download :multi-sensitivity="true" :download-type="'Multi-sensitivity Summary'">
        </sensitivity-summary-download>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ActionRequiredMessage from "@/components/ActionRequiredMessage.vue";
import ErrorInfo from "@/components/ErrorInfo.vue";
import SensitivitySummaryDownload from "@/components/sensitivity/SensitivitySummaryDownload.vue";
import baseSensitivity from "../mixins/baseSensitivity";
import { MultiSensitivityAction } from "../../store/multiSensitivity/actions";
import LoadingButton from "../LoadingButton.vue";
import userMessages from "../../userMessages";
import { BaseSensitivityGetter } from "../../store/sensitivity/getters";

export default defineComponent({
    name: "MultiSensitivityTab",
    components: {
        SensitivitySummaryDownload,
        ErrorInfo,
        ActionRequiredMessage,
        LoadingButton
    },
    setup() {
        const store = useStore();
        const namespace = "multiSensitivity";
        const { sensitivityPrerequisitesReady, updateMsg } = baseSensitivity(store, true);

        const running = computed(() => store.state.multiSensitivity.running);

        const canRunMultiSensitivity = computed(() => {
            return (
                sensitivityPrerequisitesReady.value &&
                !!store.getters[`${namespace}/${BaseSensitivityGetter.batchPars}`]
            );
        });

        const runMultiSensitivity = () => {
            setTimeout(() => {
                store.dispatch(`${namespace}/${MultiSensitivityAction.RunMultiSensitivity}`);
            }, 100);
        };

        const multiSensitivityRunStatusMsg = computed(() => {
            const solutions = store.state.multiSensitivity.result?.batch?.solutions?.length;
            if (solutions) {
                return userMessages.multiSensitivity.runSummary(solutions);
            }
            return userMessages.sensitivity.notRunYet(true);
        });

        const error = computed(() => store.state.multiSensitivity.result?.error);

        return {
            running,
            canRunMultiSensitivity,
            updateMsg,
            multiSensitivityRunStatusMsg,
            error,
            runMultiSensitivity
        };
    }
});
</script>
<style scoped>
.multi-sensitivity-status {
    background-color: #eee;
}
</style>
