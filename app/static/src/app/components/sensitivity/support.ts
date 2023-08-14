import { Commit } from "vuex";
import { SensitivityUpdateRequiredReasons } from "../../store/sensitivity/state";
import userMessages from "../../userMessages";
import { appendIf, joinStringsSentence } from "../../utils";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { AppState } from "../../store/appState/state";

export const sensitivityUpdateRequiredExplanation = (reasons: SensitivityUpdateRequiredReasons): string => {
    const explanation: string[] = [];
    const help = userMessages.sensitivity.updateReasons;
    appendIf(explanation, reasons.modelChanged, help.modelChanged);
    appendIf(explanation, reasons.parameterValueChanged && !reasons.modelChanged, help.parameterValueChanged);
    appendIf(explanation, reasons.endTimeChanged && !reasons.modelChanged, help.endTimeChanged);
    appendIf(explanation, reasons.sensitivityOptionsChanged && !reasons.modelChanged, help.sensitivityOptionsChanged);
    appendIf(explanation, reasons.numberOfReplicatesChanged && !reasons.modelChanged, help.numberOfReplicatesChanged);
    // Fallback reason if something unexpected has happened.
    appendIf(explanation, explanation.length === 0, help.unknown);
    return `${help.prefix} ${joinStringsSentence(explanation)}. ${help.suffix}.`;
};

export const verifyValidPlotSettingsTime = (state: AppState, commit: Commit) => {
    // update plot settings' end time to be valid before we use it
    const { plotSettings } = state.sensitivity;
    let endTime = plotSettings.time;
    const modelEndTime = state.run.endTime;
    if (endTime === null) {
        endTime = modelEndTime;
    } else {
        endTime = Math.max(0, Math.min(modelEndTime, endTime));
    }
    if (endTime !== plotSettings.time) {
        commit(`sensitivity/${SensitivityMutation.SetPlotTime}`, endTime);
    }
};
