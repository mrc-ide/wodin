import { ModelFitRequirements, FitUpdateRequiredReasons } from "../../store/modelFit/state";
import userMessages from "../../userMessages";
import { joinStringsSentence } from "../../utils";

const appendIf = (container: string[], test: boolean, value: string) => {
    if (test) {
        container.push(value);
    }
};

export const fitRequirementsExplanation = (reqs: ModelFitRequirements): string => {
    const explanation: string[] = [];
    const help = userMessages.modelFit.fitRequirements;
    appendIf(explanation, !reqs.hasModel, help.needsModel);
    appendIf(explanation, !reqs.hasData, help.needsData);
    // Can only tell the user to set a time variable if we have data
    appendIf(explanation, reqs.hasData && !reqs.hasTimeVariable, help.needsTimeVariable);
    // Can only tell the user to link variables if they have model and data
    appendIf(explanation, reqs.hasModel && reqs.hasData && !reqs.hasLinkedVariables, help.needsLinkedVariables);
    // Can only tell the user to set a target if we have all of the
    // above (checking hasLinkedVariables is sufficient)
    appendIf(explanation, reqs.hasLinkedVariables && !reqs.hasTarget, help.needsTarget);
    // Can only tell the user to change parameters if we have a
    // model. This shold be announced last as it's on the tab they are
    // looking at
    appendIf(explanation, reqs.hasModel && !reqs.hasParamsToVary, help.needsParamsToVary);

    // Fallback reason if something unexpected has happened.
    appendIf(explanation, explanation.length === 0, help.unknown);

    return `${help.prefix} ${joinStringsSentence(explanation)}.`;
};

export const fitUpdateRequiredExplanation = (reasons: FitUpdateRequiredReasons): string => {
    const explanation: string[] = [];
    const help = userMessages.modelFit.updateFitReasons;
    appendIf(explanation, reasons.modelChanged, help.modelChanged);
    appendIf(explanation, reasons.dataChanged, help.dataChanged);
    appendIf(explanation, reasons.linkChanged && !reasons.modelChanged && !reasons.dataChanged, help.linkChanged);
    appendIf(explanation, reasons.parameterValueChanged && !reasons.modelChanged, help.parameterValueChanged);
    appendIf(explanation, reasons.parameterToVaryChanged && !reasons.modelChanged, help.parameterToVaryChanged);
    // Fallback reason if something unexpected has happened.
    appendIf(explanation, explanation.length === 0, help.unknown);
    return `${help.prefix} ${joinStringsSentence(explanation)}. ${help.suffix}.`;
};
