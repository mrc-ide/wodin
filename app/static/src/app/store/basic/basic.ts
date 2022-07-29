import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { BasicState } from "./state";
import { model } from "../model/model";
import { code } from "../code/code";
import { sensitivity } from "../sensitivity/sensitivity";
import { logMutations } from "../plugins";
import { AppType } from "../appState/state";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        appType: AppType.Basic,
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
        code,
        sensitivity
    },
    plugins: [
        logMutations
    ]
};
