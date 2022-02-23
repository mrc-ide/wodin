import { StoreOptions } from "vuex";
import { AppState } from "../AppState";

export interface BasicState extends AppState {
    basicProp: string
}

const defaultState: BasicState = {
    title: "Basic App",
    appType: "basic",
    basicProp: "basic value"
};

// Injected into view by server
declare const appConfig: Partial<BasicState>;

export const storeOptions: StoreOptions<BasicState> = {
    state: {
        ...defaultState,
        ...appConfig
    }
};
