import { Store } from "vuex";
import { computed } from "vue";
import { AppState } from "../../store/appState/state";
import { ModelGetter } from "../../store/model/getters";
import userMessages from "../../userMessages";
import { anyTrue } from "../../utils";
import { sensitivityUpdateRequiredExplanation } from "../sensitivity/support";
import { Dict } from "../../types/utilTypes";

export default (store: Store<AppState>, multiSensitivity: boolean) => {
    const hasRunner = computed(() => store.getters[`model/${ModelGetter.hasRunner}`]);

    const sensitivityPrerequisitesReady = computed(() => {
        return hasRunner.value && !!store.state.model.odin
            && !store.state.model.compileRequired;
    });

    const sensModule = multiSensitivity ? store.state.multiSensitivity : store.state.sensitivity;

    const sensitivityUpdateRequired = computed(() => sensModule.sensitivityUpdateRequired);
    const updateMsg = computed(() => {
        if (sensModule.result?.batch?.solutions.length) {
            if (store.state.model.compileRequired) {
                return userMessages.sensitivity.compileRequiredForUpdate(multiSensitivity);
            }

            if (!store.state.model.selectedVariables.length) {
                return userMessages.model.selectAVariable;
            }

            if (anyTrue(sensitivityUpdateRequired.value as unknown as Dict<boolean>)) {
                return sensitivityUpdateRequiredExplanation(sensitivityUpdateRequired.value, multiSensitivity);
            }
        }
        return "";
    });

    return { sensitivityPrerequisitesReady, updateMsg };
};
