import { MutationPayload, Store } from "vuex";
import { AppState } from "./appState/state";
import {StateUploadMutations} from "./appState/mutations";

export const logMutations = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        console.log(mutation.type);
    });
};

export const persistState = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        if (!StateUploadMutations.includes(mutation.type) && !mutation.type.startsWith("errors")) {
            const {dispatch} = store;
            dispatch("QueueStateUpload");
        }
    });
};
