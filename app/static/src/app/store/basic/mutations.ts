import {MutationTree} from "vuex";
import {BasicState} from "./basic";
import {APIError, BasicConfig} from "../../responseTypes";

export enum BasicMutation {
    SetConfig = "SetConfig",
    AddError = "AddError"
}

//TODO: we should also set the appName on load - can we do this and AddError generically in base AppMutation? - use
// spread operator to compose here - or put base stuff in a separate module?

export const mutations: MutationTree<BasicState> = {
    [BasicMutation.SetConfig](state: BasicState, payload: BasicConfig) {
        state.config = payload
    },

    [BasicMutation.AddError](state: BasicState, payload: APIError) {
        //TODO..
    }
};
