import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import GraphSettings from "../../../../src/app/components/options/GraphSettings.vue";
import { GraphSettingsMutation } from "../../../../src/app/store/graphSettings/mutations";

describe("GraphSettings", () => {
    const mockSetLogScaleYAxis = jest.fn();

    const getWrapper = (logScaleYAxis = true) => {
        const store = new Vuex.Store<BasicState>({
            modules: {
                graphSettings: {
                    namespaced: true,
                    state: {
                        logScaleYAxis
                    } as any,
                    mutations: {
                        [GraphSettingsMutation.SetLogScaleYAxis]: mockSetLogScaleYAxis
                    }
                }
            }
        });
        return shallowMount(GraphSettings, {
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("label").text()).toBe("Log scale y axis");
        expect(wrapper.find("input").attributes("type")).toBe("checkbox");
        expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
    });

    it("commits change to log scale y axis setting", async () => {
        const wrapper = getWrapper(false);
        expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(false);
        await wrapper.find("input").setValue(true);
        expect(mockSetLogScaleYAxis).toHaveBeenCalledTimes(1);
        expect(mockSetLogScaleYAxis.mock.calls[0][1]).toBe(true);
    });
});
