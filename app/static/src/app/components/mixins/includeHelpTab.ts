import { Store } from "vuex";
import { computed } from "vue";
import { AppState } from "../../store/appState/state";

export default (store: Store<AppState>, nonHelpTabNames: string[]) => {
    const helpTabName = computed(() => {
        if (store.state.config?.help?.markdown?.length) {
            return store.state.config.help.tabName || "Explanation"; // default if markdown but no tab name
        }
        // do not show tab if no markdown
        return null;
    });
    const rightTabNames = computed(() => {
        const result = [...nonHelpTabNames];
        if (helpTabName.value) {
            result.unshift(helpTabName.value);
        }
        return result;
    });

    return {
        helpTabName,
        rightTabNames
    };
};
