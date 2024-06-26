import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import SelectedVariables from "../../../../src/app/components/code/SelectedVariables.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import {GraphsAction} from "../../../../src/app/store/graphs/actions";

describe("SelectedVariables", () => {
    const mockUpdateSelectedVariables = jest.fn();

    const getWrapper = () => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                graphs: {
                    namespaced: true,
                    state: {
                        config: [
                            {
                                selectedVariables: ["S", "R"],
                            }
                        ]
                    },
                    actions: {
                        [GraphsAction.UpdateSelectedVariables]: mockUpdateSelectedVariables
                    }
                },
                model: {
                    namespaced: true,
                    state: {
                        odinModelResponse: {
                            metadata: {
                                variables: ["S", "I", "R"]
                            }
                        },
                        paletteModel: {
                            S: "#ff0000",
                            I: "#00ff00",
                            R: "#0000ff"
                        }
                    }
                }
            }
        });

        return shallowMount(SelectedVariables, {
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
        const vars = wrapper.findAll(".selected-variables-panel span.variable");
        expect(vars.length).toBe(3);
        expect(vars.at(0)!.text()).toBe("S");
        expect((vars.at(0)!.element as HTMLElement).style.backgroundColor).toBe("rgb(255, 0, 0)");
        expect(vars.at(1)!.text()).toBe("I");
        expect((vars.at(1)!.element as HTMLElement).style.backgroundColor).toBe("rgb(187, 187, 187)");
        expect(vars.at(2)!.text()).toBe("R");
        expect((vars.at(2)!.element as HTMLElement).style.backgroundColor).toBe("rgb(0, 0, 255)");
        expect(wrapper.find("span#select-variables-all").text()).toBe("Select all");
        expect(wrapper.find("span#select-variables-none").text()).toBe("Select none");
    });

    it("clicking a selected variable unselects it", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".selected-variables-panel span.variable").at(0)!;
        await s.trigger("click");
        expect(mockUpdateSelectedVariables).toBeCalledTimes(1);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual({index: 0, selectedVariables: ["R"]});
    });

    it("clicking an unselected variables selects it", async () => {
        const wrapper = getWrapper();
        const i = wrapper.findAll(".selected-variables-panel span.variable").at(1)!;
        await i.trigger("click");
        expect(mockUpdateSelectedVariables).toBeCalledTimes(1);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual(
            {index: 0, selectedVariables: ["S", "R", "I"]});
    });

    it("clicking select all link selects all variables", async () => {
        const wrapper = getWrapper();
        wrapper.find("span#select-variables-all").trigger("click");
        expect(mockUpdateSelectedVariables).toBeCalledTimes(1);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual(
            {index: 0, selectedVariables: ["S", "I", "R"]});
    });

    it("clicking select none link unselects all variables", async () => {
        const wrapper = getWrapper();
        wrapper.find("span#select-variables-none").trigger("click");
        expect(mockUpdateSelectedVariables).toBeCalledTimes(1);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual({index: 0, selectedVariables: []});
    });
});
