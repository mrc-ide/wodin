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
import { logMutations } from "../plugins";
import { newSessionId } from "../../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultState: () => any = () => {
    return {
        sessionId: newSessionId(),
        appType: AppType.Fit,
        openVisualisationTab: VisualisationTab.Run,
        appName: null,
        config: null
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
        sensitivity
    },
    plugins: [
        logMutations
    ]
};
