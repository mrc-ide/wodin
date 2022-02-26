import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { FitConfig } from "../../responseTypes";
import { actions } from "./actions";
import { mutations } from "./mutations";
import {errors} from "../errors/errors";

export interface FitState extends AppState {
    config: null | FitConfig
}

const defaultState: () => FitState = () => {
    return {
        appType: "fit",
        appName: null,
        config: null
    };
};

export const storeOptions: StoreOptions<FitState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors
    }
};
