import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/store/basic/state";
import GraphConfig from "../../../../src/components/graphConfig/GraphConfig.vue";
import { GraphsAction } from "../../../../src/store/graphs/actions";
import { GraphsState } from "../../../../src/store/graphs/state";
import { GraphsMutation } from "../../../../src/store/graphs/mutations";
import GraphSettings from "../../../../src/components/GraphSettings.vue";

describe("GraphConfig", () => {
    const mockUpdateSelectedVariables = vi.fn();
    const mockDeleteGraph = vi.fn();
    const mockTooltipDirective = vi.fn();
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
        vi.clearAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const varBadges = wrapper.findAll(".graph-config-panel .badge");
        const varNames = wrapper.findAll(".graph-config-panel span.variable-name");
        expect(wrapper.find("button.delete-graph").exists()).toBe(true);
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
        const settings = wrapper.findComponent(GraphSettings);
        expect(settings.props("fitPlot")).toBe(false);
        expect(settings.props("graphIndex")).toBe(0);
    });

    it("starting drag sets values in event and emits setDragging", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".graph-config-panel .badge").at(0)!;
        const setData = vi.fn();
        await s.trigger("dragstart", { dataTransfer: { setData }, ctrlKey: false, metaKey: false });
        expect(setData).toHaveBeenNthCalledWith(1, "variable", "S");
        expect(setData).toHaveBeenNthCalledWith(2, "srcGraphConfig", "0");
        expect(setData).toHaveBeenNthCalledWith(3, "copyVar", "false");
    });

    it("start drag sets values copyVar to true in event when Ctrl key pressed", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".graph-config-panel .badge").at(0)!;
        const setData = vi.fn();
        await s.trigger("dragstart", { dataTransfer: { setData }, ctrlKey: true, metaKey: false });
        expect(setData).toHaveBeenNthCalledWith(3, "copyVar", "true");
    });

    it("start drag sets values copyVar to true in event when meta key pressed", async () => {
        const wrapper = getWrapper();
        const s = wrapper.findAll(".graph-config-panel .badge").at(0)!;
        const setData = vi.fn();
        await s.trigger("dragstart", { dataTransfer: { setData }, ctrlKey: false, metaKey: true });
        expect(setData).toHaveBeenNthCalledWith(3, "copyVar", "true");
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
                if (s === "srcGraphConfig") return "1";
                if (s === "copyVar") return "false";
                return null;
            }
        };
        const dropPanel = wrapper.find(".graph-config-panel");
        await dropPanel.trigger("drop", { dataTransfer });
        expect(mockUpdateSelectedVariables.mock.calls.length).toBe(2);
        expect(mockUpdateSelectedVariables.mock.calls[0][1]).toStrictEqual({
            graphIndex: 0,
            selectedVariables: ["S", "R", "I"]
        });
        expect(mockUpdateSelectedVariables.mock.calls[1][1]).toStrictEqual({ graphIndex: 1, selectedVariables: ["J"] });
    });

    it("onDrop does not attempt to remove variable if source is hidden, even with Ctrl key", async () => {
        const wrapper = getWrapper();
        const dataTransfer = {
            getData: (s: string) => {
                if (s === "variable") return "I";
                if (s === "srcGraphConfig") return "hidden";
                if (s === "copyVar") return "true";
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

    it("onDrop does not remove variable if copyVar is true", async () => {
        const wrapper = getWrapper();
        const dataTransfer = {
            getData: (s: string) => {
                if (s === "variable") return "I";
                if (s === "srcGraphConfig") return "1";
                if (s === "copyVar") return "true";
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
            "Drag variables here to select them for this graph. " +
                "Press the Ctrl or ⌘ key on drag to make a copy of a variable."
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
