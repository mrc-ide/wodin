import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { FitConfig } from "../../../../../shared/src/config/FitConfig";

export interface FitState extends AppState {
    config: FitConfig
}

const defaultState: FitState = {
    title: "Model Fit App",
    appType: "fit",
    appName: null,
    config: {
        fitProp: "fit value"
    }
};

export const storeOptions: StoreOptions<FitState> = {
    state: defaultState
};
