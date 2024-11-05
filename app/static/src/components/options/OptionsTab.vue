<template>
    <div>
        <sensitivity-options
            v-if="sensitivityOpen || multiSensitivityOpen"
            :multi-sensitivity="multiSensitivityOpen"
        ></sensitivity-options>
        <vertical-collapse v-if="isFit" title="Link" collapse-id="link-data">
            <link-data></link-data>
        </vertical-collapse>
        <vertical-collapse title="Model Parameters" collapse-id="model-params">
            <parameter-values></parameter-values>
        </vertical-collapse>
        <vertical-collapse title="Run Options" collapse-id="run-options">
            <run-options></run-options>
        </vertical-collapse>
        <vertical-collapse v-if="fitTabIsOpen" title="Optimisation" collapse-id="optimisation">
            <optimisation-options></optimisation-options>
        </vertical-collapse>
        <vertical-collapse
            v-if="!isStochastic"
            title="Advanced Settings"
            collapse-id="advanced-settings"
            :collapsed-default="true"
        >
            <advanced-settings></advanced-settings>
        </vertical-collapse>
        <vertical-collapse v-if="!isStochastic" title="Saved Parameter Sets" collapse-id="parameter-sets">
            <parameter-sets></parameter-sets>
        </vertical-collapse>
        <graph-configs-collapsible v-if="!fitTabIsOpen"></graph-configs-collapsible>
        <vertical-collapse v-if="fitTabIsOpen" title="Fit Graph Settings" collapse-id="graph-settings">
            <graph-settings class="pt-2" :fit-plot="true"></graph-settings>
        </vertical-collapse>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import GraphConfigsCollapsible from "@/components/graphConfig/GraphConfigsCollapsible.vue";
import VerticalCollapse from "../VerticalCollapse.vue";
import ParameterValues from "./ParameterValues.vue";
import RunOptions from "./RunOptions.vue";
import LinkData from "./LinkData.vue";
import SensitivityOptions from "./SensitivityOptions.vue";
import OptimisationOptions from "./OptimisationOptions.vue";
import { AppType, VisualisationTab } from "../../store/appState/state";
import GraphSettings from "../GraphSettings.vue";
import ParameterSets from "./ParameterSets.vue";
import AdvancedSettings from "./AdvancedSettings.vue";

export default defineComponent({
    name: "OptionsTab",
    components: {
        GraphConfigsCollapsible,
        ParameterSets,
        LinkData,
        OptimisationOptions,
        ParameterValues,
        RunOptions,
        SensitivityOptions,
        VerticalCollapse,
        GraphSettings,
        AdvancedSettings
    },
    setup() {
        const store = useStore();
        const isFit = computed(() => store.state.appType === AppType.Fit);
        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);

        const sensitivityOpen = computed(() => store.state.openVisualisationTab === VisualisationTab.Sensitivity);
        const multiSensitivityOpen = computed(() => {
            return store.state.openVisualisationTab === VisualisationTab.MultiSensitivity;
        });
        const fitTabIsOpen = computed(() => store.state.openVisualisationTab === VisualisationTab.Fit);

        return {
            isFit,
            isStochastic,
            sensitivityOpen,
            multiSensitivityOpen,
            fitTabIsOpen
        };
    }
});
</script>
