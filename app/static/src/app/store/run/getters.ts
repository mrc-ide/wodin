import {RunState} from "./state";
import {Getter, GetterTree} from "vuex";
import {AppState} from "../appState/state";
import {Dict} from "../../types/utilTypes";
import {lineStyleForParameterSetIndex} from "../../plot";

export enum RunGetter {
    lineStylesForParameterSets
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
    }
};