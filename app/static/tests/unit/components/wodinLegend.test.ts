import WodinLegend, { LegendConfig } from "@/components/WodinLegend.vue";
import { shallowMount } from "@vue/test-utils";

describe("Wodin legend", () => {
  const getWrapper = () => {
    const legendConfigs: Record<string, LegendConfig> = {
      S: {
        color: "red",
        type: "line",
        enabled: true
      },
      I: {
        color: "lime",
        type: "point",
        enabled: false
      }
    };

    return shallowMount(WodinLegend, {
      props: { legendConfigs }
    });
  };

  test("renders as expected", () => {
    const wrapper = getWrapper();
    const legend = wrapper.find("div");
    expect(legend.classes()).toContain("legend");
    const legendRows = legend.findAll("div");
    expect(legendRows.length).toBe(2);
    const [ sRow, iRow ] = legendRows;

    expect(sRow.classes()).toContain("legend-row");
    expect(sRow.classes()).not.toContain("faded");
    expect(sRow.find("line").exists()).toBe(true);
    expect(sRow.text()).toBe("S");

    expect(iRow.classes()).toContain("legend-row");
    expect(iRow.classes()).toContain("faded");
    expect(iRow.find("circle").exists()).toBe(true);
    expect(iRow.text()).toBe("I");
  });

  test("emits correct legend row", async () => {
    const wrapper = getWrapper();
    const legendRows = wrapper.findAll(".legend-row");
    await legendRows[1].trigger("click");
    expect(wrapper.emitted("legendClick")![0][0]).toBe("I");
  });
});
