import { shallowMount, VueWrapper } from "@vue/test-utils";
import Vuex from "vuex";
import LinkData from "../../../../src/app/components/options/LinkData.vue";
import { FitState } from "../../../../src/app/store/fit/state";
import { getters } from "../../../../src/app/store/fitData/getters";
import { FitDataMutation } from "../../../../src/app/store/fitData/mutations";
import { mockFitDataState, mockFitState, mockModelState } from "../../../mocks";

describe("LinkData", () => {
    const getWrapper = (includeColumns = true, includeValidModel = true, mockSetLinkedVariable = jest.fn()) => {
        const store = new Vuex.Store<FitState>({
            state: mockFitState(),
            modules: {
                fitData: {
                    namespaced: true,
                    state: mockFitDataState({
                        columns: includeColumns ? ["Day", "Cases", "Admissions"] : null,
                        timeVariable: includeColumns ? "Day" : null,
                        linkedVariables: includeColumns && includeColumns ? {
                            Cases: "I",
                            Admissions: null
                        } : {}
                    }),
                    getters,
                    mutations: {
                        [FitDataMutation.SetLinkedVariable]: mockSetLinkedVariable
                    }
                },
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinModelResponse: {
                            valid: includeValidModel,
                            metadata: {
                                variables: includeValidModel ? ["S", "I", "R"] : []
                            }
                        } as any
                    })
                }
            }
        });
        return shallowMount(LinkData, {
            global: {
                plugins: [store]
            }
        });
    };

    const checkExpectedSelectOptions = (select: HTMLSelectElement) => {
        const { options } = select;
        expect(options.length).toBe(4);
        expect(options[0].text).toBe("-- no link --");
        expect(options[0].value).toBe("");
        expect(options[1].text).toBe("S");
        expect(options[1].value).toBe("S");
        expect(options[2].text).toBe("I");
        expect(options[2].value).toBe("I");
        expect(options[3].text).toBe("R");
        expect(options[3].value).toBe("R");
    };

    const checkCannotLink = (wrapper: VueWrapper<any>) => {
        const rows = wrapper.findAll(".row");
        expect(rows.length).toBe(1);
        expect(rows.at(0)!.text()).toBe("Please upload data and compile model in order to select links.");
        expect(wrapper.find("label").exists()).toBe(false);
        expect(wrapper.find("select").exists()).toBe(false);
    };

    it("renders as expected when data can be linked", () => {
        const wrapper = getWrapper();
        const rows = wrapper.findAll(".row");
        expect(rows.length).toBe(2);

        expect(rows.at(0)!.find("label").text()).toBe("Cases");
        const select1 = rows.at(0)!.find("select").element as HTMLSelectElement;
        expect(select1.selectedOptions.length).toBe(1);
        expect(select1.selectedOptions[0].text).toBe("I");
        expect(select1.value).toBe("I");
        checkExpectedSelectOptions(select1);

        expect(rows.at(1)!.find("label").text()).toBe("Admissions");
        const select2 = rows.at(1)!.find("select").element as HTMLSelectElement;
        expect(select2.selectedOptions.length).toBe(1);
        expect(select2.selectedOptions[0].text).toBe("-- no link --");
        expect(select2.value).toBe("");
        checkExpectedSelectOptions(select2);
    });

    it("updates linked variable on select variable", async () => {
        const mockSetLinkedVariable = jest.fn();
        const wrapper = getWrapper(true, true, mockSetLinkedVariable);
        const admissionsSelect = wrapper.findAll("select").at(1)!;
        (admissionsSelect.element as HTMLSelectElement).value = "R";
        await admissionsSelect.trigger("change");
        expect(mockSetLinkedVariable).toHaveBeenCalledTimes(1);
        expect(mockSetLinkedVariable.mock.calls[0][1]).toStrictEqual({column: "Admissions", variable: "R"});
    });

    it("updates linked variable on select no link", async () => {
        const mockSetLinkedVariable = jest.fn();
        const wrapper = getWrapper(true, true, mockSetLinkedVariable);
        const casesSelect = wrapper.findAll("select").at(0)!;
        (casesSelect.element as HTMLSelectElement).value = "";
        await casesSelect.trigger("change");
        expect(mockSetLinkedVariable).toHaveBeenCalledTimes(1);
        expect(mockSetLinkedVariable.mock.calls[0][1]).toStrictEqual({column: "Cases", variable: null});
    });

    it("renders as expected when data has not been uploaded", () => {
        const wrapper = getWrapper(false, true);
        checkCannotLink(wrapper);
    });

    it("renders as expected when model has not been compiled", () => {
        const wrapper = getWrapper(true, false);
        checkCannotLink(wrapper);
    });

    it("renders as expected without neither data nor compiled data", () => {
        const wrapper = getWrapper(false, false);
        checkCannotLink(wrapper);
    });
});
