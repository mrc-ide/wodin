import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { BasicConfig } from "../../../../../shared/src/models/BasicConfig";

export interface BasicState extends AppState {
   config: BasicConfig
}

const defaultState: BasicState = {
    title: "Basic App",
    appType: "basic",
    appName: null,
    config: {
        basicProp: "basic value"
    }
};

export const storeOptions: StoreOptions<BasicState> = {
    state: defaultState
};
