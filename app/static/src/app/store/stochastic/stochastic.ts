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
import { sessions } from "../sessions/sessions";
import { versions } from "../versions/versions";
import { graphs } from "../graphs/graphs";
import { getters } from "../appState/getters";
import { getStoreModule } from "../../../../translationPackage";
import { multiSensitivity } from "../multiSensitivity/multiSensitivity";

const language = getStoreModule();

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        sessionId: newSessionId(),
        sessionLabel: null,
        appType: AppType.Stochastic,
        openVisualisationTab: VisualisationTab.Run,
        appName: null,
        baseUrl: null,
        appsPath: null,
        config: null,
        loadSessionId: null,
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false,
        configured: false,
        persisted: false
    };
};

export const storeOptions: StoreOptions<StochasticState> = {
    state: defaultState(),
    actions,
    mutations,
    getters,
    modules: {
        errors,
        code,
        model,
        run,
        sensitivity,
        multiSensitivity,
        sessions,
        versions,
        graphs,
        language
    },
    plugins: [logMutations, persistState]
};
