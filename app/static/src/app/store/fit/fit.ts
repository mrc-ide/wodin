import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { FitState } from "./state";
import { model } from "../model/model";
import { code } from "../code/code";
import { fitData } from "../fitData/fitData";
import { modelFit } from "../modelFit/modelFit";
import { AppType } from "../appState/state";
import { logMutations } from "../plugins";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        appType: AppType.Fit,
        appName: null,
        config: null
    };
};

export const storeOptions: StoreOptions<FitState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors,
        code,
        model,
        fitData,
        modelFit
    },
    plugins: [
        logMutations
    ]
};
