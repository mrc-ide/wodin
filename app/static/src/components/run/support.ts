import { RunUpdateRequiredReasons } from "../../store/run/state";
import userMessages from "../../userMessages";
import { appendIf, joinStringsSentence } from "../../utils";

export const runRequiredExplanation = (reasons: RunUpdateRequiredReasons): string => {
    const explanation: string[] = [];
    const help = userMessages.run.updateReasons;
    appendIf(explanation, reasons.modelChanged, help.modelChanged);
    appendIf(explanation, reasons.parameterValueChanged && !reasons.modelChanged, help.parameterValueChanged);
    appendIf(explanation, reasons.endTimeChanged && !reasons.modelChanged, help.endTimeChanged);
    appendIf(explanation, reasons.numberOfReplicatesChanged, help.numberOfReplicatesChanged);
    appendIf(explanation, reasons.advancedSettingsChanged, help.advancedSettingsChanged);
    // Fallback reason if something unexpected has happened.
    appendIf(explanation, explanation.length === 0, help.unknown);
    return `${help.prefix} ${joinStringsSentence(explanation)}. ${help.suffix}.`;
};
