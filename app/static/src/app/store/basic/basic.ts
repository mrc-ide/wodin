import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { BasicState } from "./state";
import { model, defaultState as defaultModelState } from "../model/model";
import { code, defaultState as defaultCodeState } from "../code/code";

const defaultState: () => BasicState = () => {
    return {
        appType: "basic",
        appName: null,
        config: null,
        code: defaultCodeState,
        model: defaultModelState
    };
};

export const storeOptions: StoreOptions<BasicState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors,
        model,
        code
    }
};
