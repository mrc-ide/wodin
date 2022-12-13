import {RunState} from "./state";
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
        return !!state.parameterSets.length && anyTrue({...state.runRequired, parameterValueChanged: false});
    }
};