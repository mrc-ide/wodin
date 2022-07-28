import Vuex, { Store } from "vuex";
import { nextTick } from "vue";
import { mount, shallowMount, VueWrapper } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import { mockModelFitState, mockModelState } from "../../../mocks";
import { ModelMutation, mutations } from "../../../../src/app/store/model/mutations";
import { AppType } from "../../../../src/app/store/appState/state";
import Mock = jest.Mock;
import { ModelFitMutation } from "../../../../src/app/store/modelFit/mutations";

describe("ParameterValues", () => {
    const getStore = (mockUpdateParameterValues: Mock<any, any> | null = null, paramsToVary: string[] = [],
        mockSetParamsToVary = jest.fn()) => {
        // Use mock or real mutations
        const storeMutations = mockUpdateParameterValues
            ? { UpdateParameterValues: mockUpdateParameterValues } : mutations;

        const store = new Vuex.Store<BasicState>({
            state: { appType: AppType.Fit } as any,
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        parameterValues: new Map([["param1", 1], ["param2", 2.2]])
                    }),
                    mutations: storeMutations
                },
                modelFit: {
                    namespaced: true,
                    state: mockModelFitState({ paramsToVary }),
                    mutations: {
                        [ModelFitMutation.SetParamsToVary]: mockSetParamsToVary
                    }
                }
            }
        });
        return store;
    };

    const getWrapper = (store: Store<BasicState>, fitTabIsOpen = false) => {
        return shallowMount(ParameterValues, {
            global: {
                plugins: [store]
            },
            props: {
                fitTabIsOpen
            }
        });
    };

    it("renders as expected when fit tab is not open", () => {
        const wrapper = getWrapper(getStore());
        const rows = wrapper.findAll("div.row");

        const p1 = rows.at(0)!;
        expect(p1.find("label").text()).toBe("param1");
        const input1 = p1.findComponent(NumericInput);
        expect(input1.props("value")).toBe(1);
        expect(p1.find("input.vary-param-check").exists()).toBe(false);

        const p2 = rows.at(1)!;
        expect(p2.find("label").text()).toBe("param2");
        const input2 = p2.findComponent(NumericInput);
        expect(input2.props("value")).toBe(2.2);
        expect(p2.find("input.vary-param-check").exists()).toBe(false);

        expect(wrapper.find("#select-param-msg").text()).toBe("");
    });

    it("renders as expected when fit tab is open", () => {
        const wrapper = getWrapper(getStore(null, ["param1"]), true);
        const rows = wrapper.findAll("div.row");

        const p1 = rows.at(0)!;
        expect(p1.find("label").text()).toBe("param1");
        const input1 = p1.findComponent(NumericInput);
        expect(input1.props("value")).toBe(1);
        expect(p1.find("input.vary-param-check").exists()).toBe(true);
        expect((p1.find("input.vary-param-check").element as HTMLInputElement).checked).toBe(true);

        const p2 = rows.at(1)!;
        expect(p2.find("label").text()).toBe("param2");
        const input2 = p2.findComponent(NumericInput);
        expect(input2.props("value")).toBe(2.2);
        expect((p2.find("input.vary-param-check").element as HTMLInputElement).checked).toBe(false);

        expect(wrapper.find("#select-param-msg").text()).toBe("");
    });

    it("shows select param to vary message if fit tab is open and none are selected", () => {
        const wrapper = getWrapper(getStore(null, []), true);
        expect(wrapper.find("#select-param-msg").text()).toBe(
            "Please select at least one parameter to vary during model fit."
        );
    });

    it("commits parameter value change", async () => {
        const mockUpdateParameterValues = jest.fn();
        const wrapper = getWrapper(getStore(mockUpdateParameterValues));
        const input2 = wrapper.findAllComponents(NumericInput).at(1)!;
        await input2.vm.$emit("update", 3.3);
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(1);
        expect(mockUpdateParameterValues.mock.calls[0][1]).toStrictEqual({ param2: 3.3 });
    });

    it("refreshes cleared input when odinSolution changes", async () => {
        const store = getStore();
        const wrapper = mount(ParameterValues, {
            global: {
                plugins: [store]
            }
        });
        wrapper.findAll("input").at(1)!.setValue("");

        store.commit(`model/${ModelMutation.SetOdinSolution}`, {});
        await nextTick();
        expect(wrapper.findAllComponents(NumericInput).at(1)!.props("value")).toBe(2.2);
        expect((wrapper.findAll("input").at(1)!.element as HTMLInputElement).value).toBe("2.2");
    });

    it("updates params to vary when checkbox is checked", async () => {
        const mockSetParamsToVary = jest.fn();
        const store = getStore(null, ["param1"], mockSetParamsToVary);
        const wrapper = getWrapper(store, true);
        const row2 = wrapper.findAll("div.row").at(1)!;
        await row2.find("input.vary-param-check").setValue(true);
        expect(mockSetParamsToVary).toHaveBeenCalledTimes(1);
        expect(mockSetParamsToVary.mock.calls[0][1]).toStrictEqual(["param1", "param2"]);
    });

    it("updates params to vary when checkbox is unchecked", async () => {
        const mockSetParamsToVary = jest.fn();
        const store = getStore(null, ["param1"], mockSetParamsToVary);
        const wrapper = getWrapper(store, true);
        const row1 = wrapper.findAll("div.row").at(0)!;
        await row1.find("input.vary-param-check").setValue(false);
        expect(mockSetParamsToVary).toHaveBeenCalledTimes(1);
        expect(mockSetParamsToVary.mock.calls[0][1]).toStrictEqual([]);
    });
});
