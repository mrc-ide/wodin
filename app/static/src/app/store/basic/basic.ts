import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { BasicState } from "./state";

const defaultState: () => BasicState = () => {
    return {
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
