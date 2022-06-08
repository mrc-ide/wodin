import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { BasicState } from "./state";
import { model } from "../model/model";
import { code } from "../code/code";
import { logMutations } from "../plugins";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
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
        errors,
        model,
        code
    },
    plugins: [
        logMutations
    ]
};
