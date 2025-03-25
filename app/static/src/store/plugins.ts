import { MutationPayload, Store } from "vuex";
import { AppState } from "./appState/state";
import { StateUploadMutations } from "./appState/mutations";
import { STATIC_BUILD } from "../parseEnv";
import { RunMutation } from "./run/mutations";
import { RunAction } from "./run/actions";

export const logMutations = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        console.log(mutation.type);
    });
};

export const persistState = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        if (!StateUploadMutations.includes(mutation.type) && !mutation.type.startsWith("errors")) {
            const { dispatch } = store;
            dispatch("QueueStateUpload");
        }
    });
};

// we want the graph to update automatically when users of static wodin
// change parameter values
export const rerunModel = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        if (STATIC_BUILD && mutation.type === `run/${RunMutation.SetParameterValues}`) {
            store.dispatch(`run/${RunAction.RunModel}`);
        }
    });
};
