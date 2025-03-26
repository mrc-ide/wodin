import Vuex from "vuex";
import { logMutations, persistState, rerunModel } from "../../../src/store/plugins";
import { AppState } from "../../../src/store/appState/state";
import { AppStateAction } from "../../../src/store/appState/actions";
import { AppStateMutation } from "../../../src/store/appState/mutations";
import { RunMutation } from "@/store/run/mutations";
import { RunAction } from "@/store/run/actions";
import * as Env from "@/parseEnv";

vi.mock("@/parseEnv");

describe("plugins", () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("logMutations logs mutations to console", () => {
        const logSpy = vi.spyOn(console, "log");

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
        const spyDispatch = vi.spyOn(store, "dispatch");
        persistState(store);
        store.commit("testModule/test2");
        expect(spyDispatch).toHaveBeenCalledWith(AppStateAction.QueueStateUpload);
    });

    it("persistState does not dispatch QueueStateUpload for any StateUploadMutation", () => {
        const store = new Vuex.Store<AppState>({
            mutations: {
                [AppStateMutation.ClearQueuedStateUpload]: () => {},
                [AppStateMutation.SetQueuedStateUpload]: () => {},
                [AppStateMutation.SetStateUploadInProgress]: () => {}
            }
        });
        const spyDispatch = vi.spyOn(store, "dispatch");
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
        const spyDispatch = vi.spyOn(store, "dispatch");
        persistState(store);

        store.commit("errors/addError");
        expect(spyDispatch).not.toHaveBeenCalled();
    });

    it("rerun model triggers when parameter values are set only when STATIC_BUILD is true", () => {
        vi.mocked(Env).STATIC_BUILD = true;
        const mockRunModel = vi.fn();
        const store = new Vuex.Store<AppState>({
            modules: {
                run: {
                    namespaced: true,
                    mutations: {
                        [RunMutation.SetParameterValues]: () => {}
                    },
                    actions: {
                        [RunAction.RunModel]: mockRunModel
                    }
                }
            }
        });

        rerunModel(store);
        store.commit(`run/${RunMutation.SetParameterValues}`);
        expect(mockRunModel).toHaveBeenCalledTimes(1);

        vi.mocked(Env).STATIC_BUILD = false;
        store.commit(`run/${RunMutation.SetParameterValues}`);
        expect(mockRunModel).toHaveBeenCalledTimes(1);
    });
});
