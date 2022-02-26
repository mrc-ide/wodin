import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { StochasticConfig } from "../../responseTypes";
import { actions } from "./actions";
import { mutations } from "./mutations";
import {errors} from "../errors/errors";

export interface StochasticState extends AppState {
    config: null | StochasticConfig
}

const defaultState: () => StochasticState = () => {
    return {
        appType: "stochastic",
        appName: null,
        config: null
    };
};

export const storeOptions: StoreOptions<StochasticState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors
    }
};
