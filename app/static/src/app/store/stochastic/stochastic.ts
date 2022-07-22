import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { StochasticState } from "./state";
import { model } from "../model/model";
import { code } from "../code/code";
import { AppType } from "../appState/state";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        appType: AppType.Stochastic,
        appName: null,
        config: null
    };
};

export const storeOptions: StoreOptions<StochasticState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors,
        code,
        model
    }
};
