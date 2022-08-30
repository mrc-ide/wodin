import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { BasicState } from "./state";
import { model } from "../model/model";
import { run } from "../run/run";
import { code } from "../code/code";
import { sensitivity } from "../sensitivity/sensitivity";
import { logMutations, persistState } from "../plugins";
import { AppType, VisualisationTab } from "../appState/state";
import { newSessionId } from "../../utils";
import { localStorageManager } from "../../localStorageManager";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        sessionId: newSessionId(),
        appType: AppType.Basic,
        openVisualisationTab: VisualisationTab.Run,
        appName: null,
        config: null,
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false
    };
};

export const storeOptions: StoreOptions<BasicState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors,
        model,
        run,
        code,
        sensitivity
    },
    plugins: [
        logMutations,
        persistState
    ]
};

localStorageManager.addSessionId((storeOptions.state as BasicState).sessionId);
