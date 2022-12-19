import {ParameterSet, RunState} from "./state";
import {Getter, GetterTree} from "vuex";
import {AppState} from "../appState/state";
import {Dict} from "../../types/utilTypes";
import {lineStyleForParameterSetIndex} from "../../plot";
import {anyTrue} from "../../utils";

export enum RunGetter {
    lineStylesForParameterSets = "lineStylesForParameterSets",
    runIsRequired = "runIsRequired",
    runParameterSetsIsRequired = "runParameterSetsIsRequired"
}

export interface RunGetters {
    [RunGetter.lineStylesForParameterSets]: Getter<RunState, AppState>
}

export const getters: RunGetters & GetterTree<RunState, AppState> = {
    [RunGetter.lineStylesForParameterSets]: (state: RunState): Dict<string> => {
        const result: Dict<string> = {};
        state.parameterSets.forEach((set, idx) => {
            result[set.name] = lineStyleForParameterSetIndex(idx);
        });
        return result;
    },
    [RunGetter.runIsRequired]: (state: RunState): boolean => {
        return anyTrue(state.runRequired as unknown as Dict<boolean>);
    },
    [RunGetter.runParameterSetsIsRequired]: (state: RunState): boolean => {
        if (!state.parameterSets.length) {
            return false;
        }
        // We need to run for param sets if we are missing results for any param sets, as well as if there is
        // an update required for any reason except parameterValueChanged (e.g. endTime has changed)
        const missingSetResults = state.parameterSets.some((ps: ParameterSet) => !state.parameterSetResults[ps.name]?.solution);
        return missingSetResults || anyTrue({...state.runRequired, parameterValueChanged: false});
    }
};