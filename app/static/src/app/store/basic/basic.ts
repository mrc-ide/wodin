import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { BasicConfig } from "../../responseTypes";
import { actions } from "./actions";
import { mutations } from "./mutations";
import {errors} from "../errors/errors";

export interface BasicState extends AppState {
   config: null | BasicConfig
}

const defaultState: () => BasicState = () => {
    return {
        title: "Basic App",
        appType: "basic",
        appName: null,
        config: null
    };
};

export const storeOptions: StoreOptions<BasicState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors
    }
};
