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
import { newUid } from "../../utils";
import { sessions } from "../sessions/sessions";
import { versions } from "../versions/versions";
import { graphs } from "../graphs/graphs";
import { getters } from "../appState/getters";
import { getStoreModule } from "../../../translationPackage";
import { multiSensitivity } from "../multiSensitivity/multiSensitivity";

const language = getStoreModule();

const defaultState = () => {
    return {
        sessionId: newUid(),
        sessionLabel: null,
        appType: AppType.Basic,
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

export const storeOptions: StoreOptions<BasicState> = {
    state: defaultState() as BasicState,
    actions,
    mutations,
    getters,
    modules: {
        errors,
        model,
        run,
        code,
        sensitivity,
        multiSensitivity,
        sessions,
        versions,
        graphs,
        language
    },
    plugins: [logMutations, persistState]
};
