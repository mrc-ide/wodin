import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { GraphsAction } from "../../../../src/app/store/graphs/actions";
import HiddenVariables from "../../../../src/app/components/graphConfig/HiddenVariables.vue";
import { GraphsGetter } from "../../../../src/app/store/graphs/getters";

// Mock the fadeColor util which uses color package, which doesn't play nicely with jest
jest.mock("../../../../src/app/components/graphConfig/utils", () => {
    return {
        fadeColor: (input: string) => {
            const match = input.match(/rgb\(([0-9]*), ([0-9]*), ([0-9]*)\)/);
            const result = `rgba(${match![1]}, ${match![2]}, ${match![3]}, 0.5)`;
            return result;
        }
    };
});

describe("HiddenVariables", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockUpdateSelectedVariables = jest.fn();

    const getWrapper = (hiddenVariables = ["I", "R"]) => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                graphs: {
                    namespaced: true,
                    state: {
                        config: [
                            {
                                selectedVariables: ["S", "J"]
                            }
                        ]
                    },
                    actions: {
                        [GraphsAction.UpdateSelectedVariables]: mockUpdateSelectedVariables
                    },
                    getters: {
                        [GraphsGetter.hiddenVariables]: () => hiddenVariables
                    } as any
                },
                model: {
                    namespaced: true,
                    state: {
                        paletteModel: {
                            S: "rgb(255, 0, 0)",
                            I: "rgb(0, 255, 0)",
                            R: "rgb(0, 0, 255)",
                            J: "rgb(0, 255, 255)"
                        }
                    }
                }
            }
        });

        return shallowMount(HiddenVariables, {
            props: {
                dragging: false
            },
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("h5").text()).toBe("Hidden variables");
        expect(wrapper.find(".drop-zone").classes()).toStrictEqual(["drop-zone", "drop-zone-inactive"]);
        const variables = wrapper.findAll(".hidden-variables-panel .variable");
        expect(variables.length).toBe(2);
        expect(variables.at(0)!.text()).toBe("I");
        expect((variables.at(0)!.element as HTMLElement).style.backgroundColor).toBe("rgba(0, 255, 0, 0.5)");
        expect(variables.at(1)!.text()).toBe("R");
        expect((variables.at(1)!.element as HTMLElement).style.backgroundColor).toBe("rgba(0, 0, 255, 0.5)");
    });

    it("starting drag sets values in event and emits setDragging", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".hidden-variables-panel .variable").at(0)!;
        const setData = jest.fn();
        await s.trigger("dragstart", { dataTransfer: { setData } });
        expect(setData.mock.calls[0][0]).toBe("variable");
        expect(setData.mock.calls[0][1]).toStrictEqual("I");
        expect(setData.mock.calls[1][0]).toStrictEqual("srcGraphConfig");
        expect(setData.mock.calls[1][1]).toStrictEqual("hidden");
        expect(wrapper.emitted("setDragging")![0]).toStrictEqual([true]);
    });

    it("ending drag emits setDragging", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".hidden-variables-panel .variable").at(0)!;
        await s.trigger("dragend");
        expect(wrapper.emitted("setDragging")![0]).toStrictEqual([false]);
    });

    it("onDrop removes variable from source", async () => {
        const wrapper = getWrapper();
        const dataTransfer = {
            getData: (s: string) => {
                if (s === "variable") return "S";
                if (s === "srcGraphConfig") return "0";
                return null;
            }
        };
        const dropPanel = wrapper.find(".hidden-variables-panel");
        await dropPanel.trigger("drop", { dataTransfer });
        expect(mockUpdateSelectedVariables.mock.calls.length).toBe(1);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual({ graphIndex: 0, selectedVariables: ["J"] });
    });

    it("shows drop zone when dragging", async () => {
        const wrapper = getWrapper();
        await wrapper.setProps({ dragging: true });
        expect(wrapper.find(".drop-zone").classes()).toStrictEqual(["drop-zone", "drop-zone-active"]);
    });

    it("shows instruction if no hidden variables", () => {
        const wrapper = getWrapper([]);
        expect(wrapper.find(".drop-zone-instruction").text()).toBe("Drag variables here to hide them on all graphs.");
    });
});
