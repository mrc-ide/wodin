import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import GraphConfig from "../../../../src/app/components/graphConfig/GraphConfig.vue";
import { GraphsAction } from "../../../../src/app/store/graphs/actions";
import { GraphsState } from "../../../../src/app/store/graphs/state";
import { GraphsMutation } from "../../../../src/app/store/graphs/mutations";

describe("GraphConfig", () => {
    const mockUpdateSelectedVariables = jest.fn();
    const mockDeleteGraph = jest.fn();
    const mockTooltipDirective = jest.fn();
    const defaultGraphState = {
        config: [
            {
                selectedVariables: ["S", "R"]
            },
            {
                selectedVariables: ["I", "J"]
            }
        ]
    } as any;

    const getWrapper = (props = {}, graphState: Partial<GraphsState> = {}) => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                graphs: {
                    namespaced: true,
                    state: {
                        ...defaultGraphState,
                        ...graphState
                    },
                    actions: {
                        [GraphsAction.UpdateSelectedVariables]: mockUpdateSelectedVariables
                    },
                    mutations: {
                        [GraphsMutation.DeleteGraph]: mockDeleteGraph
                    }
                },
                model: {
                    namespaced: true,
                    state: {
                        paletteModel: {
                            S: "#ff0000",
                            I: "#00ff00",
                            R: "#0000ff"
                        }
                    }
                }
            }
        });

        return shallowMount(GraphConfig, {
            props: {
                graphIndex: 0,
                dragging: false,
                ...props
            },
            global: {
                directives: { tooltip: mockTooltipDirective },
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const varBadges = wrapper.findAll(".graph-config-panel .badge");
        const varNames = wrapper.findAll(".graph-config-panel span.variable-name");
        expect(wrapper.find("h5").text()).toBe("Graph 1");
        expect(wrapper.find("h5 button.delete-graph").exists()).toBe(true);
        expect(varBadges.length).toBe(2);
        expect(varNames.length).toBe(2);
        expect(varNames.at(0)!.text()).toBe("S");
        expect((varBadges.at(0)!.element as HTMLElement).style.backgroundColor).toBe("rgb(255, 0, 0)");
        expect(varNames.at(1)!.text()).toBe("R");
        expect((varBadges.at(1)!.element as HTMLElement).style.backgroundColor).toBe("rgb(0, 0, 255)");
        // drop zone not active
        expect(wrapper.find(".drop-zone").classes()).toStrictEqual(["drop-zone", "drop-zone-inactive"]);
        // instruction not shown if at least one selected variable
        expect(wrapper.findAll(".drop-zone-instruction").length).toBe(0);
    });

    it("starting drag sets values in event and emits setDragging", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".graph-config-panel .badge").at(0)!;
        const setData = jest.fn();
        await s.trigger("dragstart", { dataTransfer: { setData } });
        expect(setData.mock.calls[0][0]).toBe("variable");
        expect(setData.mock.calls[0][1]).toStrictEqual("S");
        expect(setData.mock.calls[1][0]).toStrictEqual("srcGraph");
        expect(setData.mock.calls[1][1]).toStrictEqual("0");
        expect(wrapper.emitted("setDragging")![0]).toStrictEqual([true]);
    });

    it("ending drag emits setDragging", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".graph-config-panel .badge").at(0)!;
        await s.trigger("dragend");
        expect(wrapper.emitted("setDragging")![0]).toStrictEqual([false]);
    });

    it("onDrop selects variable in current graph and removes it from source", async () => {
        const wrapper = getWrapper();
        const dataTransfer = {
            getData: (s: string) => {
                if (s === "variable") return "I";
                if (s === "srcGraph") return "1";
                return null;
            }
        };
        const dropPanel = wrapper.find(".graph-config-panel");
        await dropPanel.trigger("drop", { dataTransfer });
        expect(mockUpdateSelectedVariables.mock.calls.length).toBe(2);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual({ graphIndex: 1, selectedVariables: ["J"] });
        expect(mockUpdateSelectedVariables.mock.calls[1][1]).toStrictEqual({
            graphIndex: 0,
            selectedVariables: ["S", "R", "I"]
        });
    });

    it("onDrop does not attempt to remove variable if source was hidden variables", async () => {
        const wrapper = getWrapper();
        const dataTransfer = {
            getData: (s: string) => {
                if (s === "variable") return "I";
                if (s === "srcGraph") return "hidden";
                return null;
            }
        };
        const dropPanel = wrapper.find(".graph-config-panel");
        await dropPanel.trigger("drop", { dataTransfer });
        expect(mockUpdateSelectedVariables.mock.calls.length).toBe(1);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual({
            graphIndex: 0,
            selectedVariables: ["S", "R", "I"]
        });
    });

    it("clicking remove button removes variable from graph", async () => {
        const wrapper = getWrapper();
        const button = wrapper.findAll(".variable-delete button").at(0);
        await button!.trigger("click");
        expect(mockUpdateSelectedVariables.mock.calls.length).toBe(1);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual({ graphIndex: 0, selectedVariables: ["R"] });
    });

    it("shows drop zone when dragging", () => {
        const wrapper = getWrapper({ dragging: true });
        expect(wrapper.find(".drop-zone").classes()).toStrictEqual(["drop-zone", "drop-zone-active"]);
    });

    it("shows instruction if no selected variables", () => {
        const wrapper = getWrapper({}, {
            config: [
                {
                    selectedVariables: []
                }
            ]
        } as any);
        expect(wrapper.find(".drop-zone-instruction").text()).toBe(
            "Drag variables here to select them for this graph."
        );
    });

    it("does not render delete button if there is only one graph", () => {
        const wrapper = getWrapper({}, {
            config: [
                {
                    selectedVariables: ["S", "R"]
                }
            ]
        } as any);
        expect(wrapper.find("h5 button.delete-graph").exists()).toBe(false);
    });

    it("delete button commits mutation", async () => {
        const wrapper = getWrapper();
        await wrapper.find("button.delete-graph").trigger("click");
        expect(mockDeleteGraph).toHaveBeenCalledTimes(1);
        expect(mockDeleteGraph.mock.calls[0][1]).toBe(0);
    });
});
