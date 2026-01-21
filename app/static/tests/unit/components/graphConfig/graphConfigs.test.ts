import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { nextTick } from "vue";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState } from "../../../mocks";
import { GraphsAction } from "../../../../src/store/graphs/actions";
import GraphConfigs from "../../../../src/components/graphConfig/GraphConfigs.vue";
import GraphConfig from "../../../../src/components/graphConfig/GraphConfig.vue";
import HiddenVariables from "../../../../src/components/graphConfig/HiddenVariables.vue";
import { fitGraphId } from "@/store/graphs/state";
import { VisualisationTab } from "@/store/appState/state";
import GraphSettings from "@/components/GraphSettings.vue";

describe("GraphConfigs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockNewGraph = vi.fn();
    const namespaced = true;
    const fitGraphConfig = { id: fitGraphId };
    const getWrapper = (fitTabOpen = false) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                configured: true,
                openVisualisationTab: fitTabOpen
                    ? VisualisationTab.Fit
                    : VisualisationTab.Run
            }),
            modules: {
                graphs: {
                    namespaced,
                    state: {
                        config: [
                            { selectedVariables: ["S"], unselectedVariables: ["I", "R"] },
                            { selectedVariables: ["I"], unselectedVariables: ["S", "R"] }
                        ],
                        fitGraphConfig
                    },
                    actions: {
                        [GraphsAction.NewGraph]: mockNewGraph
                    }
                }
            }
        });
        return shallowMount(GraphConfigs, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("#graph-configs-instruction").text()).toContain(
            "Drag variables to 'Hidden variables' to remove"
        );
        const graphConfigComps = wrapper.findAllComponents(GraphConfig);
        expect(graphConfigComps.length).toBe(2);
        expect(graphConfigComps.at(0)!.props("graphConfig")).toStrictEqual(
            { selectedVariables: ["S"], unselectedVariables: ["I", "R"] }
        );
        expect(graphConfigComps.at(0)!.props("dragging")).toBe(false);
        expect(graphConfigComps.at(1)!.props("graphConfig")).toStrictEqual(
            { selectedVariables: ["I"], unselectedVariables: ["S", "R"] }
        );
        expect(graphConfigComps.at(1)!.props("dragging")).toBe(false);
        expect(wrapper.find("button").text()).toBe("Add Graph");
        expect(wrapper.findComponent(HiddenVariables).props("dragging")).toBe(false);
    });

    it("renders as expected when fit tab is open", () => {
        const wrapper = getWrapper(true);
        const graphSettings = wrapper.findComponent(GraphSettings);
        expect(graphSettings.props("graphConfig")).toStrictEqual(fitGraphConfig);
    });

    it("sets dragging on emit from GraphConfig", async () => {
        const wrapper = getWrapper();
        const graphConfig = wrapper.findAllComponents(GraphConfig).at(0)!;
        graphConfig.vm.$emit("setDragging", true);
        await nextTick();
        expect(graphConfig.props("dragging")).toBe(true);
        expect(wrapper.findComponent(HiddenVariables).props("dragging")).toBe(true);
    });

    it("sets dragging on emit from HiddenVariables", async () => {
        const wrapper = getWrapper();
        const hiddenVars = wrapper.findComponent(HiddenVariables);
        hiddenVars.vm.$emit("setDragging", true);
        await nextTick();
        expect(hiddenVars.props("dragging")).toBe(true);
        expect(wrapper.findAllComponents(GraphConfig).at(0)!.props("dragging")).toBe(true);
    });

    it("Add Graph click invokes action", async () => {
        const wrapper = getWrapper();
        expect(mockNewGraph).toHaveBeenCalledTimes(0);
        await wrapper.find("button").trigger("click");
        expect(mockNewGraph).toHaveBeenCalledTimes(1);
    });
});
