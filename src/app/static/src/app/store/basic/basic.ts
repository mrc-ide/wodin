import {AppState} from "../AppState";
import {StoreOptions} from "vuex";

export interface BasicState extends AppState {
    basicProp: string
}

export const storeOptions: StoreOptions<BasicState> = {
    state: {
        title: "Basic App",
        appType: "basic",
        basicProp: "basic value"
    }
};
