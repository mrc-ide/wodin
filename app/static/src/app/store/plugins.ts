import { MutationPayload, Store } from "vuex";
import { AppState } from "./AppState";

export const logMutations = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        console.log(mutation.type);
    });
};
