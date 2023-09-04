import { shallowMount } from "@vue/test-utils";
import MultiSensitivityTab from "../../../../src/app/components/multiSensitivity/MultiSensitivityTab.vue";
import {AppState} from "../../../../src/app/store/appState/state";
import Vuex from "vuex";
import LoadingButton from "../../../../src/app/components/LoadingButton.vue";
import {ModelState} from "../../../../src/app/store/model/state";

describe("MultiSensitivityTab", () => {
    const getWrapper = (running = false, modelState: Partial<ModelState> = {}) => {
        const store = new Vuex.Store<AppState>({
            state: {} as any,
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        odin: {},
                        compileRequired: false,
                        ...modelState
                    },
                    getters: {
                        hasRunner: true
                    }
                } as any,
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        running
                    },
                    getters: {
                        batchPars: {}
                    }
                } as any
            }
        });

        return shallowMount(MultiSensitivityTab, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders loading button in loading state when multi-sensitivity is running", () => {
        const wrapper = getWrapper(true);
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(true);
    });

    it("renders loading button in non-loading state when multi-sensitivity is not running", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(false);
    });

    it("Run button is enabled when multi-sensitivity prerequisites are ready and batchPars can be generated", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(false);
    });

    //it("Run button is not enabled when multi-sensitivity prerequisites are not ready");

    //it("Run button is not enabled when batchPars cannot be generated");
});
