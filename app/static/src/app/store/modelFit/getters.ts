import { Getter, GetterTree } from "vuex";
import { ModelFitState, ModelFitRequirements } from "./state";
import { FitState } from "../fit/state";
import userMessages from "../../userMessages";
import { joinStringsSentence } from "../../utils";

export enum ModelFitGetter {
    canRunFit = "canRunFit",
    fitRequirements = "fitRequirements"
}

export interface ModelFitGetters {
    [ModelFitGetter.canRunFit]: Getter<ModelFitState, FitState>
}

// I've put this here for want of a better place. Within userMessages
// feels possible but that would break the default import.
export const fitRequirementsExplanation = (reqs: ModelFitRequirements): string => {
    const reasons: string[] = [];
    const appendIf = (test: boolean, value: string) => {
        if (test) {
            reasons.push(value);
        }
    }
    const help = userMessages.modelFit.fitRequirements;
    appendIf(!reqs.hasModel, help.needsModel);
    appendIf(!reqs.hasData, help.needsData);
    appendIf(reqs.hasData && !reqs.hasTimeVariable, help.needsTimeVariable);
    appendIf(!reqs.hasTarget, help.needsTarget);
    appendIf(!reqs.hasParamsToVary, help.needsParamsToVary);

    return `${help.prefix} ${joinStringsSentence(reasons)}.`;
}

export const getters: ModelFitGetters & GetterTree<ModelFitState, FitState> = {
    [ModelFitGetter.canRunFit]: (state: ModelFitState, _: ModelFitGetters, rootState: FitState) => {
        return !!(rootState.model.odin && rootState.model.odinRunner && rootState.fitData.data
            && rootState.fitData.timeVariable && rootState.fitData.columnToFit && state.paramsToVary.length);
    },

    [ModelFitGetter.fitRequirements]: (state: ModelFitState, _: ModelFitGetters, rootState: FitState): ModelFitRequirements => {
        const checklist = {
            hasModel: !!rootState.model.odin,
            hasData: !!rootState.fitData.data,
            hasTimeVariable: !!rootState.fitData.timeVariable,
            hasTarget: !!rootState.fitData.columnToFit,
            hasParamsToVary: !!state.paramsToVary.length,
            hasEverything: true
        };
        checklist.hasEverything = Object.values(checklist).every((x: boolean) => x);
        return checklist;
    }
};
