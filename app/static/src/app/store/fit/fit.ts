import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { FitConfig } from "../../responseTypes";

export interface FitState extends AppState {
    config: null | FitConfig
}

const defaultState: FitState = {
    title: "Model Fit App",
    appType: "fit",
    appName: null,
    config: null
};

export const storeOptions: StoreOptions<FitState> = {
    state: defaultState
};
