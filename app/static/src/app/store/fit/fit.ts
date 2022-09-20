import { StoreOptions } from "vuex";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { errors } from "../errors/errors";
import { FitState } from "./state";
import { model } from "../model/model";
import { run } from "../run/run";
import { code } from "../code/code";
import { sensitivity } from "../sensitivity/sensitivity";
import { fitData } from "../fitData/fitData";
import { modelFit } from "../modelFit/modelFit";
import { AppType, VisualisationTab } from "../appState/state";
import { logMutations, persistState } from "../plugins";
import { newSessionId } from "../../utils";
import { localStorageManager } from "../../localStorageManager";
import { sessions } from "../sessions/sessions";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        sessionId: newSessionId(),
        appType: AppType.Fit,
        openVisualisationTab: VisualisationTab.Run,
        appName: null,
        config: null,
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false
    };
};

export const storeOptions: StoreOptions<FitState> = {
    state: defaultState(),
    actions,
    mutations,
    modules: {
        errors,
        code,
        model,
        run,
        fitData,
        modelFit,
        sensitivity,
        sessions
    },
    plugins: [
        logMutations,
        persistState
    ]
};

localStorageManager.addSessionId((storeOptions.state as FitState).sessionId);
