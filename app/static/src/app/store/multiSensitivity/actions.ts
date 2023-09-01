import {BatchPars} from "../../types/responseTypes";
import {ActionContext, ActionTree} from "vuex";
import {SensitivityState} from "../sensitivity/state";
import {AppState, AppType} from "../appState/state";
import {ModelGetter} from "../model/getters";
import {OdinSensitivityResult} from "../../types/wrapperTypes";
import userMessages from "../../userMessages";
import {SensitivityMutation} from "../sensitivity/mutations";
import {SensitivityGetter} from "../sensitivity/getters";
import {Dict} from "../../types/utilTypes";
import {SensitivityAction} from "../sensitivity/actions";
import {MultiSensitivityState} from "./state";

export enum MultiSensitivityAction {
    RunMultiSensitivity = "RunMultiSensitivity",
    ComputeNext = "ComputeNext"
}

export const actions: ActionTree<MultiSensitivityState, AppState> = {
    [MultiSensitivityAction.RunMultiSensitivity](context) {
        const {rootState, getters} = context;
        const {endTime} = rootState.run;
        const batchPars = getters[SensitivityGetter.batchPars];

        //runSensitivity(batchPars, endTime, context);
    }
}