import { MutationPayload, Store } from "vuex";
import { AppState } from "./appState/state";

export const logMutations = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        console.log(mutation.type);
    });
};
