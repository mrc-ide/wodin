<template>
    <wodin-app>
        <template v-slot:left>
            <wodin-tabs id="left-tabs" :tabNames="leftTabNames" :init-selected-tab="initSelectedTab">
                <template v-slot:Code>
                    <code-tab></code-tab>
                </template>
                <template v-slot:Options>
                    <options-tab></options-tab>
                </template>
            </wodin-tabs>
        </template>
        <template v-slot:right>
            <wodin-tabs id="right-tabs" :tabNames="rightTabNames" @tabSelected="rightTabSelected">
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
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import MultiSensitivityTab from "@/components/multiSensitivity/MultiSensitivityTab.vue";
import { VisualisationTab } from "../../store/appState/state";
import { AppStateMutation } from "../../store/appState/mutations";
import WodinTabs from "../WodinTabs.vue";
import WodinApp from "../WodinApp.vue";
import CodeTab from "../code/CodeTab.vue";
import RunTab from "../run/RunTab.vue";
import OptionsTab from "../options/OptionsTab.vue";
import SensitivityTab from "../sensitivity/SensitivityTab.vue";
import includeConfiguredTabs from "../mixins/includeConfiguredTabs";
import HelpTab from "../help/HelpTab.vue";

const leftTabNames = ['Code', 'Options'] as const;

export default defineComponent({
    name: "StochasticApp",
    components: {
        MultiSensitivityTab,
        CodeTab,
        HelpTab,
        RunTab,
        OptionsTab,
        SensitivityTab,
        WodinApp,
        WodinTabs
    },
    props: {
        initSelectedTab: { type: String as PropType<typeof leftTabNames[number]>, required: false }
    },
    setup() {
        const store = useStore();
        const rightTabSelected = (tab: string) => {
            store.commit(AppStateMutation.SetOpenVisualisationTab, tab);
        };
        const { helpTabName, rightTabNames } = includeConfiguredTabs(store, [
            VisualisationTab.Run,
            VisualisationTab.Sensitivity
        ]);

        return {
            helpTabName,
            rightTabNames,
            rightTabSelected,
            leftTabNames
        };
    }
});
</script>
