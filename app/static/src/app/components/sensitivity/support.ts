import { Commit } from "vuex";
import { SensitivityUpdateRequiredReasons } from "../../store/sensitivity/state";
import userMessages from "../../userMessages";
import { appendIf, joinStringsSentence } from "../../utils";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { AppState } from "../../store/appState/state";

export const sensitivityUpdateRequiredExplanation = (
  reasons: SensitivityUpdateRequiredReasons,
  multiSens: boolean
): string => {
  const explanation: string[] = [];
  const help = userMessages.sensitivity.updateReasons;
  const prefix = multiSens ? userMessages.multiSensitivity.updateReasons.prefix : help.prefix;
  appendIf(explanation, reasons.modelChanged, help.modelChanged);
  appendIf(explanation, reasons.parameterValueChanged && !reasons.modelChanged, help.parameterValueChanged);
  appendIf(explanation, reasons.endTimeChanged && !reasons.modelChanged, help.endTimeChanged);
  appendIf(
    explanation,
    reasons.sensitivityOptionsChanged && !reasons.modelChanged,
    help.sensitivityOptionsChanged(multiSens)
  );
  appendIf(explanation, reasons.numberOfReplicatesChanged && !reasons.modelChanged, help.numberOfReplicatesChanged);
  appendIf(explanation, reasons.advancedSettingsChanged, help.advancedSettingsChanged);
  // Fallback reason if something unexpected has happened.
  appendIf(explanation, explanation.length === 0, help.unknown);
  return `${prefix} ${joinStringsSentence(explanation)}. ${help.suffix(multiSens)}.`;
};

export const verifyValidPlotSettingsTime = (state: AppState, commit: Commit): void => {
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
