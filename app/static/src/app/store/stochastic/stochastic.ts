import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { StochasticState } from "./state";
import { model } from "../model/model";
import { run } from "../run/run";
import { code } from "../code/code";
import { sensitivity } from "../sensitivity/sensitivity";
import { AppType, VisualisationTab } from "../appState/state";
import { newSessionId } from "../../utils";
import { logMutations, persistState } from "../plugins";
import { localStorageManager } from "../../localStorageManager";
import {sessions} from "../sessions/sessions";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        sessionId: newSessionId(),
        appType: AppType.Stochastic,
        openVisualisationTab: VisualisationTab.Run,
        appName: null,
        config: null,
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false
    };
};

export const storeOptions: StoreOptions<StochasticState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors,
        code,
        model,
        run,
        sensitivity,
        sessions
    },
    plugins: [
        logMutations,
        persistState
    ]
};

localStorageManager.addSessionId((storeOptions.state as StochasticState).sessionId);
