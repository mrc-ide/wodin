import { ModelFitRequirements, RerunFitReasons } from "../../store/modelFit/state";
import userMessages from "../../userMessages";
import { joinStringsSentence } from "../../utils";

const appendIf = (container: string[], test: boolean, value: string) => {
    if (test) {
        container.push(value);
    }
};

export const fitRequirementsExplanation = (reqs: ModelFitRequirements): string => {
    const reasons: string[] = [];
    const help = userMessages.modelFit.fitRequirements;
    appendIf(reasons, !reqs.hasModel, help.needsModel);
    appendIf(reasons, !reqs.hasData, help.needsData);
    // Can only tell the user to set a time variable if we have data
    appendIf(reasons, reqs.hasData && !reqs.hasTimeVariable, help.needsTimeVariable);
    // Can only tell the user to link variables if they have model and data
    appendIf(reasons, reqs.hasModel && reqs.hasData && !reqs.hasLinkedVariables, help.needsLinkedVariables);
    // Can only tell the user to set a target if we have all of the
    // above (checking hasLinkedVariables is sufficient)
    appendIf(reasons, reqs.hasLinkedVariables && !reqs.hasTarget, help.needsTarget);
    // Can only tell the user to change parameters if we have a
    // model. This shold be announced last as it's on the tab they are
    // looking at
    appendIf(reasons, reqs.hasModel && !reqs.hasParamsToVary, help.needsParamsToVary);

    // Fallback reason if something unexpected has happened.
    appendIf(reasons, reasons.length === 0, help.unknown);

    return `${help.prefix} ${joinStringsSentence(reasons)}.`;
};

export const fitUpdateRequiredExplanation = (reqs: RerunFitReasons): string => {
    const reasons: string[] = [];
    const help = userMessages.modelFit.updateFitReasons;
    appendIf(reasons, reqs.modelChanged, help.modelChanged);
    appendIf(reasons, reqs.dataChanged, help.dataChanged);
    appendIf(reasons, reqs.linkChanged && !reqs.modelChanged && !reqs.dataChanged, help.linkChanged);
    // Fallback reason if something unexpected has happened.
    appendIf(reasons, reasons.length === 0, help.unknown);
    return `${help.prefix} ${joinStringsSentence(reasons)}. ${help.suffix}.`;
}
