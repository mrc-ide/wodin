import { StoreOptions } from "vuex";
import { AppState } from "../AppState";

export interface FitState extends AppState {
    fitProp: string
}

const defaultState: FitState = {
    title: "Model Fit App",
    appType: "fit",
    fitProp: "fit value"
};

// Injected into view by server
declare const appConfig: Partial<FitState>;

export const storeOptions: StoreOptions<FitState> = {
    state: {
        ...defaultState,
        ...appConfig
    }
};
