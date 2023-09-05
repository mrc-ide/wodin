import { Store } from "vuex";
import { computed } from "vue";
import { AppState } from "../../store/appState/state";
import { ModelGetter } from "../../store/model/getters";
import userMessages from "../../userMessages";
import { anyTrue } from "../../utils";
import {sensitivityUpdateRequiredExplanation, verifyValidPlotSettingsTime} from "../sensitivity/support";
import { Dict } from "../../types/utilTypes";
import {BaseSensitivityMutation} from "../../store/sensitivity/mutations";
import {BaseSensitivityAction, SensitivityAction} from "../../store/sensitivity/actions";

export default (store: Store<AppState>, multiSensitivity: boolean) => {
    const namespace = multiSensitivity ? "multiSensitivity" : "sensitivity";

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

    const downloading = computed(() => sensModule.downloading);

    // only allow download if update not required, and if we have run sensitivity
    const canDownloadSummary = computed(() => !updateMsg.value && sensModule.result?.batch);

    const downloadSummaryUserFileName = computed({
        get: () => sensModule.userSummaryDownloadFileName,
        set: (newVal) => {
            store.commit(`${namespace}/${BaseSensitivityMutation.SetUserSummaryDownloadFileName}`, newVal);
        }
    });

    const downloadSummary = ((payload: { fileName: string }) => {
        verifyValidPlotSettingsTime(store.state, store.commit);
        store.dispatch(`${namespace}/${BaseSensitivityAction.DownloadSummary}`, payload.fileName);
    });

    return {
        sensitivityPrerequisitesReady,
        updateMsg,
        downloading,
        canDownloadSummary,
        downloadSummaryUserFileName,
        downloadSummary
    };
};
