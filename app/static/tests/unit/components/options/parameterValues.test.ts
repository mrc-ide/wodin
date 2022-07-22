import Vuex, { Store } from "vuex";
import { nextTick } from "vue";
import { mount, shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import { mockModelState } from "../../../mocks";
import { ModelMutation, mutations } from "../../../../src/app/store/model/mutations";
import Mock = jest.Mock;

describe("ParameterValues", () => {
    const getStore = (mockUpdateParameterValues: Mock<any, any> | null = null) => {
        // Use mock or real mutations
        const storeMutations = mockUpdateParameterValues
            ? { UpdateParameterValues: mockUpdateParameterValues } : mutations;

        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        parameterValues: new Map([["param1", 1], ["param2", 2.2]])
                    }),
                    mutations: storeMutations
                }
            }
        });
        return store;
    };

    const getWrapper = (store: Store<BasicState>) => {
        return shallowMount(ParameterValues, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper(getStore());
        const rows = wrapper.findAll("div.row");

        const p1 = rows.at(0)!;
        expect(p1.find("label").text()).toBe("param1");
        const input1 = p1.findComponent(NumericInput);
        expect(input1.props("value")).toBe(1);

        const p2 = rows.at(1)!;
        expect(p2.find("label").text()).toBe("param2");
        const input2 = p2.findComponent(NumericInput);
        expect(input2.props("value")).toBe(2.2);
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
});
