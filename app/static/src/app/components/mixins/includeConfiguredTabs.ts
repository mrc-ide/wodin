import { Store } from "vuex";
import { computed } from "vue";
import {AppState, VisualisationTab} from "../../store/appState/state";

export default (store: Store<AppState>, fixedTabNames: string[]) => {
    const helpTabName = computed(() => {
        if (store.state.config?.help?.markdown?.length) {
            return store.state.config.help.tabName || "Explanation"; // default if markdown but no tab name
        }
        // do not show tab if no markdown
        return null;
    });
    const multiSensitivityTabName = computed(() => {
        return store.state.config?.multiSensitivity ? VisualisationTab.MultiSensitivity : null;
    });
    const rightTabNames = computed(() => {
        const result = [...fixedTabNames];
        if (multiSensitivityTabName.value) {
            result.push(multiSensitivityTabName.value);
        }
        if (helpTabName.value) {
            result.unshift(helpTabName.value);
        }
        return result;
    });

    return {
        helpTabName,
        multiSensitivityTabName,
        rightTabNames
    };
};
