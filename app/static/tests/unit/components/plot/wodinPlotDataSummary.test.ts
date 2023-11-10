import { shallowMount } from "@vue/test-utils";
import WodinPlotDataSummary from "../../../../src/app/components/plot/WodinPlotDataSummary.vue";

describe("WodinPlotDataSummary", () => {
    const getWrapper = () => {
        const data = [
            {
                name: "test markers",
                x: [1, 2],
                y: [3, 4],
                mode: "markers",
                marker: {
                    color: "#ff0000"
                }
            },
            {
                name: "test lines",
                x: [0, 10, 20],
                y: [7, 8, 9],
                mode: "lines",
                line: {
                    color: "#ff00ff",
                    dash: "dot"
                }
            }
        ] as any;
        return shallowMount(WodinPlotDataSummary, {
            props: { data }
        });
    };

    it("renders hidden data summary elements", async () => {
        const wrapper = getWrapper();
        const summaryContainer = wrapper.find(".wodin-plot-data-summary");
        const seriesSummaries = summaryContainer.findAll(".wodin-plot-data-summary-series");
        expect(seriesSummaries.length).toBe(2);
        const summary1 = seriesSummaries.at(0)!;
        expect(summary1.attributes("name")).toBe("test markers");
        expect(summary1.attributes("count")).toBe("2");
        expect(summary1.attributes("x-min")).toBe("1");
        expect(summary1.attributes("x-max")).toBe("2");
        expect(summary1.attributes("y-min")).toBe("3");
        expect(summary1.attributes("y-max")).toBe("4");
        expect(summary1.attributes("mode")).toBe("markers");
        expect(summary1.attributes("line-dash")).toBe(undefined);
        expect(summary1.attributes("marker-color")).toBe("#ff0000");
        const summary2 = seriesSummaries.at(1)!;
        expect(summary2.attributes("name")).toBe("test lines");
        expect(summary2.attributes("count")).toBe("3");
        expect(summary2.attributes("x-min")).toBe("0");
        expect(summary2.attributes("x-max")).toBe("20");
        expect(summary2.attributes("y-min")).toBe("7");
        expect(summary2.attributes("y-max")).toBe("9");
        expect(summary2.attributes("mode")).toBe("lines");
        expect(summary2.attributes("line-dash")).toBe("dot");
        expect(summary2.attributes("line-color")).toBe("#ff00ff");
    });

    it("renders nothing if no data or empty data", () => {
        const emptyWrapper = shallowMount(WodinPlotDataSummary, {
            props: { data: [] }
        });
        expect(emptyWrapper.find("div").exists()).toBe(false);

        const nullWrapper = shallowMount(WodinPlotDataSummary, {});
        expect(nullWrapper.find("div").exists()).toBe(false);
    });
});
