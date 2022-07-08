import Vuex, { Store } from "vuex";
import { nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
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
        const input1 = p1.find("input")!;
        expect(input1.attributes("type")).toBe("number");
        expect((input1.element as HTMLInputElement).value).toBe("1");

        const p2 = rows.at(1)!;
        expect(p2.find("label").text()).toBe("param2");
        const input2 = p2.find("input")!;
        expect(input2.attributes("type")).toBe("number");
        expect((input2.element as HTMLInputElement).value).toBe("2.2");
    });

    it("commits parameter value change", async () => {
        const mockUpdateParameterValues = jest.fn();
        const wrapper = getWrapper(getStore(mockUpdateParameterValues));
        const input2 = wrapper.findAll("input").at(1)!;
        await input2.setValue("3.3");
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(1);
        expect(mockUpdateParameterValues.mock.calls[0][1]).toStrictEqual({ param2: 3.3 });
    });

    it("does not commit parameter value change to empty string", async () => {
        const mockUpdateParameterValues = jest.fn();
        const wrapper = getWrapper(getStore(mockUpdateParameterValues));
        const input2 = wrapper.findAll("input").at(1)!;
        await input2.setValue("");
        expect(mockUpdateParameterValues).not.toHaveBeenCalled();
    });

    it("refreshes cleared input when odinSolution changes", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);
        wrapper.findAll("input").at(1)!.setValue("");

        store.commit(`model/${ModelMutation.SetOdinSolution}`, {});
        await nextTick();
        expect((wrapper.findAll("input").at(1)!.element as HTMLInputElement).value).toBe("2.2");
    });
});
