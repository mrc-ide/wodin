import { Getter, GetterTree } from "vuex";
import { ModelFitState, ModelFitRequirements } from "./state";
import { FitState } from "../fit/state";
import userMessages from "../../userMessages";
import { joinStringsSentence } from "../../utils";

export enum ModelFitGetter {
    fitRequirements = "fitRequirements"
}

export interface ModelFitGetters {
    [ModelFitGetter.fitRequirements]: Getter<ModelFitState, FitState>
}

// I've put this here for want of a better place. Within userMessages
// feels possible but that would break the default import.
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
    // Can only tell the user to set a target if we have both a model
    // and data
    appendIf(reqs.hasModel && reqs.hasData && !reqs.hasTarget, help.needsTarget);
    // Can only tell the user to change parameters if we have a
    // model. This shold be announced last as it's on the tab they are
    // looking at
    appendIf(reqs.hasModel && !reqs.hasParamsToVary, help.needsParamsToVary);

    return `${help.prefix} ${joinStringsSentence(reasons)}.`;
};

export const getters: ModelFitGetters & GetterTree<ModelFitState, FitState> = {
    [ModelFitGetter.fitRequirements]: (state: ModelFitState, _: ModelFitGetters,
        rootState: FitState): ModelFitRequirements => {
        const checklist = {
            hasModel: !!rootState.model.odin,
            hasData: !!rootState.fitData.data,
            hasTimeVariable: !!rootState.fitData.timeVariable,
            hasTarget: !!rootState.fitData.columnToFit,
            hasParamsToVary: !!state.paramsToVary.length
        };
        return checklist;
    }
};
