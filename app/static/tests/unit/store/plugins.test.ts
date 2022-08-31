import Vuex from "vuex";
import { logMutations, persistState } from "../../../src/app/store/plugins";
import { AppState } from "../../../src/app/store/appState/state";
import {AppStateAction} from "../../../src/app/store/appState/actions";
import {AppStateMutation} from "../../../src/app/store/appState/mutations";

describe("plugins", () => {
    it("logMutations logs mutations to console", () => {
        const logSpy = jest.spyOn(console, "log");

        const store = new Vuex.Store<AppState>({
            mutations: {
                test: () => {}
            },
            modules: {
                testModule: {
                    namespaced: true,
                    mutations: {
                        test2: () => {}
                    }
                }
            }
        });
        logMutations(store);
        store.commit("test");
        store.commit("testModule/test2");
        expect(logSpy.mock.calls.length).toBe(2);
        expect(logSpy.mock.calls[0][0]).toBe("test");
        expect(logSpy.mock.calls[1][0]).toBe("testModule/test2");
    });

    it("persistState dispatches QueueStateUpload", () => {
        const store = new Vuex.Store<AppState>({
            modules: {
                testModule: {
                    namespaced: true,
                    mutations: {
                        test2: () => {}
                    }
                }
            }
        });
        const spyDispatch = jest.spyOn(store, "dispatch");
        persistState(store);
        store.commit("testModule/test2");
        expect(spyDispatch).toHaveBeenCalledWith(AppStateAction.QueueStateUpload);
    });

    it("persistState does not dispatch QueueStateUpload for any StateUploadMutation", () => {
        const store = new Vuex.Store<AppState>({
            mutations: {
                [AppStateMutation.ClearQueuedStateUpload]:  () => {},
                [AppStateMutation.SetQueuedStateUpload]: () => {},
                [AppStateMutation.SetStateUploadInProgress]: () => {}
            }
        });
        const spyDispatch = jest.spyOn(store, "dispatch");
        persistState(store);

        store.commit(AppStateMutation.ClearQueuedStateUpload);
        store.commit(AppStateMutation.SetQueuedStateUpload);
        store.commit(AppStateMutation.SetStateUploadInProgress);
        expect(spyDispatch).not.toHaveBeenCalled();
    });

    it("persistState does not dispatch QueueStatusUpload for errors mutation", () => {
        const store = new Vuex.Store<AppState>({
            modules: {
                errors: {
                    namespaced: true,
                    mutations: {
                        addError: () => {}
                    }
                }
            }
        });
        const spyDispatch = jest.spyOn(store, "dispatch");
        persistState(store);

        store.commit("errors/addError");
        expect(spyDispatch).not.toHaveBeenCalled();
    });
});
