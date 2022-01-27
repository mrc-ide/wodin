import {AppState} from "../AppState";
import {StoreOptions} from "vuex";

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
