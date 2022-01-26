import {AppState} from "../AppState";
import {StoreOptions} from "vuex";

export interface BasicState extends AppState {
    basicProp: string
}

const defaultState: BasicState = {
    title: "Basic App",
    appType: "basic",
    basicProp: "basic value"
};

// Injected into view by server
declare const appConfig: BasicState;

export const storeOptions: StoreOptions<BasicState> = {
    state: {
        ...defaultState,
        ...appConfig
    }
};
