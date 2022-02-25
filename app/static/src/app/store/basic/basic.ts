import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { BasicConfig } from "../../responseTypes";
import { actions } from "./actions";
import { mutations } from "./mutations";

export interface BasicState extends AppState {
   config: null | BasicConfig
}

const defaultState: BasicState = {
    title: "Basic App",
    appType: "basic",
    appName: null,
    config: null
};

export const storeOptions: StoreOptions<BasicState> = {
    state: defaultState,
    actions,
    mutations
};
