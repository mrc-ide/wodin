<template>
    <wodin-app>
        <template v-slot:left>
            <wodin-tabs id="left-tabs" :tabNames="['Code', 'Options']">
                <template v-slot:Code>
                    <code-tab></code-tab>
                </template>
                <template v-slot:Options>
                    <options-tab></options-tab>
                </template>
            </wodin-tabs>
        </template>
        <template v-slot:right>
            <wodin-tabs id="right-tabs"
                        :tab="tab"
                        :tabNames="rightTabNames"
                        @tabSelected="rightTabSelected">
                <template v-if="helpTabName" v-slot:[helpTabName]>
                    <help-tab></help-tab>
                </template>
                <template v-slot:Run>
                    <run-tab></run-tab>
                </template>
                <template v-slot:Sensitivity>
                    <sensitivity-tab></sensitivity-tab>
                </template>
                <template v-slot:Multi-sensitivity>
                    <multi-sensitivity-tab></multi-sensitivity-tab>
                </template>
            </wodin-tabs>
        </template>
    </wodin-app>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import WodinApp from "../WodinApp.vue";
import WodinTabs from "../WodinTabs.vue";
import CodeTab from "../code/CodeTab.vue";
import RunTab from "../run/RunTab.vue";
import OptionsTab from "../options/OptionsTab.vue";
import SensitivityTab from "../sensitivity/SensitivityTab.vue";
import MultiSensitivityTab from "../multiSensitivity/MultiSensitivityTab.vue";
import { AppStateMutation } from "../../store/appState/mutations";
import { VisualisationTab } from "../../store/appState/state";
import HelpTab from "../help/HelpTab.vue";
import includeConfiguredTabs from "../mixins/includeConfiguredTabs";
import { BasicState } from "@/store/basic/state";

export default defineComponent({
    name: "BasicApp",
    components: {
        HelpTab,
        CodeTab,
        RunTab,
        OptionsTab,
        SensitivityTab,
        MultiSensitivityTab,
        WodinApp,
        WodinTabs
    },
    setup() {
        const store = useStore<BasicState>();

        const tab = computed(() => store.state.openVisualisationTab);

        const rightTabSelected = (tab: string) => {
            store.commit(AppStateMutation.SetOpenVisualisationTab, tab);
        };
        const { helpTabName, multiSensitivityTabName, rightTabNames } = includeConfiguredTabs(store, [
            VisualisationTab.Run,
            VisualisationTab.Sensitivity
        ]);

        // help tab is selected by default
        onMounted(() => {
            if (helpTabName.value) rightTabSelected(helpTabName.value)
        });

        return {
            rightTabSelected,
            helpTabName,
            multiSensitivityTabName,
            rightTabNames,
            tab,
        };
    }
});
</script>
