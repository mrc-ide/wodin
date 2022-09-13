import { SensitivityUpdateRequiredReasons } from "../../store/sensitivity/state";
import userMessages from "../../userMessages";
import { appendIf, joinStringsSentence } from "../../utils";

export const sensitivityUpdateRequiredExplanation = (reasons: SensitivityUpdateRequiredReasons): string => {
    const explanation: string[] = [];
    const help = userMessages.sensitivity.updateReasons;
    appendIf(explanation, reasons.modelChanged, help.modelChanged);
    appendIf(explanation, reasons.parameterValueChanged && !reasons.modelChanged, help.parameterValueChanged);
    appendIf(explanation, reasons.endTimeChanged && !reasons.modelChanged, help.endTimeChanged);
    appendIf(explanation, reasons.sensitivityOptionsChanged && !reasons.modelChanged, help.sensitivityOptionsChanged);
    // Fallback reason if something unexpected has happened.
    appendIf(explanation, explanation.length === 0, help.unknown);
    return `${help.prefix} ${joinStringsSentence(explanation)}. ${help.suffix}.`;
};
