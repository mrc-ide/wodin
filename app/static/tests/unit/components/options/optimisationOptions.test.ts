import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { mockFitDataState } from "../../../mocks";
import { FitState } from "../../../../src/store/fit/state";
import OptimisationOptions from "../../../../src/components/options/OptimisationOptions.vue";
import { FitDataAction } from "../../../../src/store/fitData/actions";

describe("OptimisationOptions", () => {
    const getWrapper = (fitDataState = mockFitDataState(), mockUpdateColumnToFit = vi.fn()) => {
        const store = new Vuex.Store<FitState>({
            state: {} as any,
            modules: {
                fitData: {
                    namespaced: true,
                    state: fitDataState,
                    actions: {
                        [FitDataAction.UpdateColumnToFit]: mockUpdateColumnToFit
                    }
                }
            }
        });
        return shallowMount(OptimisationOptions, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected when no linked variables", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".row").text()).toBe("Please link at least one column in order to set target to fit.");
        expect(wrapper.find("select").exists()).toBe(false);
    });

    it("renders as expected when one linked variable", () => {
        const wrapper = getWrapper(
            mockFitDataState({
                columnToFit: "col1",
                linkedVariables: {
                    col1: "A",
                    col2: null,
                    col3: null
                }
            })
        );
        expect(wrapper.find(".row label").text()).toBe("Target to fit");
        expect(wrapper.find(".row select").exists()).toBe(false);
        expect(wrapper.find(".row label#target-fit-label").text()).toBe("col1 ~ A");
    });

    it("renders as expected when more than one linked variable", () => {
        const wrapper = getWrapper(
            mockFitDataState({
                columnToFit: "col2",
                linkedVariables: {
                    col1: "A",
                    col2: "B",
                    col3: null
                }
            })
        );
        expect(wrapper.find(".row label").text()).toBe("Target to fit");
        const select = wrapper.find(".row select");
        expect((select.element as HTMLSelectElement).value).toBe("col2");
        const options = select.findAll("option");
        expect(options.length).toBe(2);
        expect(options.at(0)!.text()).toBe("col1 ~ A");
        expect(options.at(0)!.attributes("value")).toBe("col1");
        expect(options.at(1)!.text()).toBe("col2 ~ B");
        expect(options.at(1)!.attributes("value")).toBe("col2");
    });

    it("updates column to fit when select changes", async () => {
        const mockUpdateColumnToFit = vi.fn();
        const state = mockFitDataState({
            columnToFit: "col2",
            linkedVariables: {
                col1: "A",
                col2: "B"
            }
        });
        const wrapper = getWrapper(state, mockUpdateColumnToFit);
        const select = wrapper.find("select");
        (select.element as HTMLSelectElement).value = "col1";
        await select.trigger("change");
        expect(mockUpdateColumnToFit).toHaveBeenCalledTimes(1);
        expect(mockUpdateColumnToFit.mock.calls[0][1]).toBe("col1");
    });
});
