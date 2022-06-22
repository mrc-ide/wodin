import Vuex from "vuex";
import { logMutations } from "../../../src/app/store/plugins";
import { State } from "../../../src/app/store/appState/AppState";

describe("plugins", () => {
    it("logMutations logs mutations to console", () => {
        const logSpy = jest.spyOn(console, "log");

        const store = new Vuex.Store<State>({
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
});
