import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { StochasticState } from "./state";
import { model, defaultState as defaultModelState } from "../model/model";
import { code, defaultState as defaultCodeState } from "../code/code";

const defaultState: () => StochasticState = () => {
    return {
        appType: "stochastic",
        appName: null,
        config: null,
        code: defaultCodeState,
        model: defaultModelState
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
