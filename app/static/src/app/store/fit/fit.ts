import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { FitState } from "./state";

const defaultState: () => FitState = () => {
    return {
        appType: "fit",
        appName: null,
        config: null
    };
};

export const storeOptions: StoreOptions<FitState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors
    }
};
