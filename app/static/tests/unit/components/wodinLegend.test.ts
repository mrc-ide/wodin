import WodinLegend, { LegendConfig } from "@/components/WodinLegend.vue";
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { AppState } from "@/store/appState/state";
import { mockBasicState } from "../../mocks";

describe("Wodin legend", () => {
  const getWrapper = () => {
    const legendConfigs: Record<string, LegendConfig> = {
      S: {
        color: "red",
        type: "line",
        faded: false
      },
      I: {
        color: "lime",
        type: "point",
        faded: true
      }
    };

    const store = new Vuex.Store<AppState>({
      state: mockBasicState()
    });

    return shallowMount(WodinLegend, {
      props: { legendConfigs },
      global: { plugins: [store] }
    });
  };

  test("renders as expected", () => {
    const wrapper = getWrapper();
    const legend = wrapper.find("div");
    expect(legend.classes()).toContain("legend");
    const legendRows = legend.findAll("div");
    expect(legendRows.length).toBe(3);
    const [ sRow, iRow, hiddenRow ] = legendRows;

    expect(sRow.classes()).toContain("legend-row");
    expect(sRow.classes()).not.toContain("faded");
    expect(sRow.find("line").exists()).toBe(true);
    expect(sRow.text()).toBe("S");

    expect(iRow.classes()).toContain("legend-row");
    expect(iRow.classes()).toContain("faded");
    expect(iRow.find("circle").exists()).toBe(true);
    expect(iRow.text()).toBe("I");

    expect(hiddenRow.classes()).toContain("legend-row");
    expect(hiddenRow.classes()).toContain("hidden-legend-row");
  });

  test("emits correct legend row", async () => {
    const wrapper = getWrapper();
    const legendRows = wrapper.findAll(".legend-row");
    await legendRows[1].trigger("click");
    expect(wrapper.emitted("legendClick")![0][0]).toBe("I");
  });
});
