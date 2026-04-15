import Vuex from "vuex";
import ConfigGroup, { DragData } from "@/components/graphConfig/ConfigGroup.vue";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { BasicState } from "@/store/basic/state";
import { mockBasicState, mockGraphsState } from "../../../mocks";
import { VisualisationTab } from "@/store/appState/state";
import { defaultGraphConfig } from "@/store/graphs/state";
import { ConfigGroupIds } from "@/store/graphs/graphs";
import GraphSettings from "@/components/graphConfig/GraphSettings.vue";
import VariableBadge from "@/components/graphConfig/VariableBadge.vue";
import VueFeather from "vue-feather";
import { mutations } from "@/store/graphs/mutations";
import { test } from "vitest";

describe("Config group", () => {
  const getConfigs = () => {
    const graphConfig1 = defaultGraphConfig("123");
    graphConfig1.selectedVariables = ["S", "I"];

    const graphConfig2 = defaultGraphConfig("456");
    graphConfig2.selectedVariables = ["I", "R"];

    const graphConfig3 = defaultGraphConfig("789");

    return [graphConfig1, graphConfig2, graphConfig3];
  };

  const getWrapper = (allVariables = ["S", "I", "R"]) => {
    const mockGraph = mockGraphsState();
    const configs = getConfigs();
    mockGraph.configs.push(...configs);
    mockGraph.configGroups[ConfigGroupIds.RunAndSens].configIds = configs.map(c => c.id);

    const store = new Vuex.Store<BasicState>({
      state: mockBasicState({ openVisualisationTab: VisualisationTab.Run }),
      modules: {
        graphs: {
          namespaced: true,
          state: mockGraph,
          mutations: mutations,
        },
        model: {
          namespaced: true,
          state: {
            odinModelResponse: {
              metadata: {
                variables: allVariables
              }
            }
          }
        }
      }
    });
    return shallowMount(ConfigGroup, {
      global: {
        plugins: [store]
      }
    });
  };

  type ConfigGroupState = {
    panels: {
      id: string,
      variables: string[],
    }[],
    hidden: string[]
  }

  const expectConfigGroupState = <T extends VueWrapper>(wrapper: T, state: ConfigGroupState) => {
    const panels = wrapper.findAll(".graph-config-panel");
    expect(panels.length).toBe(state.panels.length);
    panels.forEach((p, pIdx) => {
      const currPanel = state.panels[pIdx];

      expect(p.findComponent(VueFeather).props("type")).toBe("trash-2");
      expect(p.findComponent(GraphSettings).props("config").id).toBe(currPanel.id);

      const badges = p.findAllComponents(VariableBadge);

      badges.forEach((b: any, bIdx: number) => {
        expect(b.props("variable")).toBe(currPanel.variables[bIdx])
        expect(b.props("inHidden")).toBe(false);
      });

      expect(p.find(".drop-zone-instruction").exists()).toBe(currPanel.variables.length === 0);
    })

    const hiddenPanel = wrapper.find(".hidden-variables-panel");
    const badges = hiddenPanel.findAllComponents(VariableBadge);
    badges.forEach((b: any, bIdx: number) => {
      expect(b.props("variable")).toBe(state.hidden[bIdx])
      expect(b.props("inHidden")).toBe(true);
    });

    expect(hiddenPanel.find(".drop-zone-instruction").exists()).toBe(state.hidden.length === 0);
  };

  const getDefaultConfigGroupState = (): ConfigGroupState => ({
    panels: [
      { id: "123", variables: ["S", "I"] },
      { id: "456", variables: ["I", "R"] },
      { id: "789", variables: [] },
    ],
    hidden: []
  });

  type Location = { id: string }

  const findPanel = <T extends VueWrapper>(wrapper: T, location: Location) => {
    return location.id === "hidden"
      ? wrapper.find(".hidden-variables-panel")
      : wrapper.findAll(".graph-config-panel")
          .find(panel => panel.findComponent(GraphSettings).props("config").id === location.id)!
  };

  const moveBadge = async <T extends VueWrapper>(
    wrapper: T,
    src: Location & { variable: string },
    dest: Location,
    ctrlKey = false,
    metaKey = false,
  ) => {
    const srcPanel = findPanel(wrapper, src);
    const srcBadge = srcPanel.findAllComponents(VariableBadge).find((v: any) => v.props("variable") === src.variable);
    const destPanel = findPanel(wrapper, dest);

    const setData = vi.fn();
    await srcBadge.trigger("dragstart", {
      dataTransfer: { setData },
      ctrlKey,
      metaKey,
    });

    const data = {
      [DragData.Var]: src.variable,
      [DragData.CfgId]: src.id,
      [DragData.DoCopy]: `${ctrlKey || metaKey}`,
    };

    Object.entries(data).forEach((d, i) => expect(setData).toHaveBeenNthCalledWith(i + 1, d[0], d[1]))

    const dataTransfer = { getData: (s: DragData) => data[s] };
    await destPanel.trigger("drop", { dataTransfer });
  };

  const testWithState = test.extend<{ state: ConfigGroupState }>({
    state: async ({}, use) => { await use(getDefaultConfigGroupState()) }
  });

  testWithState("renders as expected", () => {
    const wrapper = getWrapper();
    expect(wrapper.find("#graph-configs-instruction").exists()).toBe(true);
    expect(wrapper.find("#add-graph-btn").exists()).toBe(true);
    expectConfigGroupState(wrapper, getDefaultConfigGroupState());
  });

  testWithState("dropzone instruction doesn't render if there are hidden variables", ({ state }) => {
    const wrapper = getWrapper(["S", "I", "R", "M"]);
    state.hidden = ["M"];
    expectConfigGroupState(wrapper, state);
  });

  testWithState("can move badge from one graph to another", async ({ state }) => {
    const wrapper = getWrapper();
    expectConfigGroupState(wrapper, state);
    await moveBadge(
      wrapper,
      { id: "123", variable: "S" },
      { id: "456" }
    );
    state.panels[0].variables = ["I"];
    // ordering doesn't happen until graph plugin triggers so it will be appended to
    // the list at this point
    state.panels[1].variables = ["I", "R", "S"];
    expectConfigGroupState(wrapper, state);
  });

  testWithState("moving badge from one graph to another dedupes the badge", async ({ state }) => {
    const wrapper = getWrapper();
    expectConfigGroupState(wrapper, state);
    // 456 already has I
    await moveBadge(
      wrapper,
      { id: "123", variable: "I" },
      { id: "456" }
    );
    state.panels[0].variables = ["S"];
    expectConfigGroupState(wrapper, state);
  });

  testWithState("moving badge from one graph to another dedupes the badge", async ({ state }) => {
    const wrapper = getWrapper();
    expectConfigGroupState(wrapper, state);
    // 456 already has I
    await moveBadge(
      wrapper,
      { id: "123", variable: "I" },
      { id: "456" }
    );
    state.panels[0].variables = ["S"];
    expectConfigGroupState(wrapper, state);
  });

  testWithState("ctrl or meta key copies variable", async ({ state }) => {
    const wrapper = getWrapper();
    expectConfigGroupState(wrapper, state);

    // copy R to third config with ctrl
    await moveBadge(
      wrapper,
      { id: "456", variable: "R" },
      { id: "789" },
      true,
      false,
    );
    state.panels[2].variables = ["R"];
    expectConfigGroupState(wrapper, state);

    // copy I to third config with meta
    await moveBadge(
      wrapper,
      { id: "456", variable: "I" },
      { id: "789" },
      false,
      true,
    );
    state.panels[2].variables = ["R", "I"];
    expectConfigGroupState(wrapper, state);
  });

  testWithState("moving to hidden removes variable from all configs", async ({ state }) => {
    const wrapper = getWrapper();
    expectConfigGroupState(wrapper, state);

    // hide even with copy
    await moveBadge(
      wrapper,
      { id: "123", variable: "I" },
      { id: "hidden" },
      true,
    );
    state.panels[0].variables = ["S"];
    state.panels[1].variables = ["R"];
    state.hidden = ["I"];
    expectConfigGroupState(wrapper, state);
  });

  testWithState("moving from hidden removes from hidden", async ({ state }) => {
    const wrapper = getWrapper(["S", "I", "R", "M"]);
    state.hidden = ["M"];
    expectConfigGroupState(wrapper, state);

    await moveBadge(
      wrapper,
      { id: "hidden", variable: "M" },
      { id: "123" },
    );
    state.panels[0].variables = ["S", "I", "M"];
    state.hidden = [];
    expectConfigGroupState(wrapper, state);
  });
});
