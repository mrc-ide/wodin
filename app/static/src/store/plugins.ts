import { MutationPayload, Store } from "vuex";
import { AppState } from "./appState/state";
import { StateUploadMutations } from "./appState/mutations";
import { RunMutation } from "./run/mutations";
import { RunAction } from "./run/actions";
import { SensitivityAction } from "./sensitivity/actions";

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

export const rerunModel = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        if (mutation.type === `run/${RunMutation.SetParameterValues}`) {
            store.dispatch(`run/${RunAction.RunModel}`);
        }
    });
};

export const rerunSensitivity = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        if (mutation.type === `run/${RunMutation.SetParameterValues}`) {
            store.dispatch(`sensitivity/${SensitivityAction.RunSensitivity}`);
        }
    });
};
