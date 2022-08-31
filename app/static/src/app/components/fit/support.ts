import { ModelFitRequirements } from "../../store/modelFit/state";
import userMessages from "../../userMessages";
import { joinStringsSentence } from "../../utils";

export const fitRequirementsExplanation = (reqs: ModelFitRequirements): string => {
    const reasons: string[] = [];
    const appendIf = (test: boolean, value: string) => {
        if (test) {
            reasons.push(value);
        }
    };
    const help = userMessages.modelFit.fitRequirements;
    appendIf(!reqs.hasModel, help.needsModel);
    appendIf(!reqs.hasData, help.needsData);
    // Can only tell the user to set a time variable if we have data
    appendIf(reqs.hasData && !reqs.hasTimeVariable, help.needsTimeVariable);
    // Can only tell the user to link variables if they have model and data
    appendIf(reqs.hasModel && reqs.hasData && !reqs.hasLinkedVariables, help.needsLinkedVariables);
    // Can only tell the user to set a target if we have all of the
    // above (checking hasLinkedVariables is sufficient)
    appendIf(reqs.hasLinkedVariables && !reqs.hasTarget, help.needsTarget);
    // Can only tell the user to change parameters if we have a
    // model. This shold be announced last as it's on the tab they are
    // looking at
    appendIf(reqs.hasModel && !reqs.hasParamsToVary, help.needsParamsToVary);

    // Fallback reason if something unexpected has happened.
    appendIf(reasons.length === 0, help.unknown);

    return `${help.prefix} ${joinStringsSentence(reasons)}.`;
};
