import { shallowMount } from "@vue/test-utils";
import WodinPlotDataSummary from "../../../src/components/WodinPlotDataSummary.vue";
import { WodinPlotData } from "@/plot";
import { nextTick } from "vue";

describe("WodinPlotDataSummary", () => {
    const getWrapper = () => {
        const data: WodinPlotData = {
            lines: [{
                style: {
                    strokeColor: "#ff00ff",
                    strokeDasharray: "3"
                },
                points: [
                    { x: 0, y: 7 },
                    { x: 10, y: 8 },
                    { x: 20, y: 9 },
                ],
                metadata: {
                    color: "#ff00ff",
                    name: "test lines",
                    tooltipName: "test lines",
                }
            }],
            points: [
                {
                    style: {
                        color: "#ff0000",
                    },
                    x: 1,
                    y: 3,
                    metadata: {
                        color: "#ff0000",
                        name: "test points",
                        tooltipName: "test points",
                    }
                },
                {
                    style: {
                        color: "#ff0000",
                    },
                    x: 2,
                    y: 4,
                    metadata: {
                        color: "#ff0000",
                        name: "test points",
                        tooltipName: "test points",
                    }
                }
            ]
        }
        return shallowMount(WodinPlotDataSummary, {
            props: { data }
        });
    };

    it("renders hidden data summary elements", async () => {
        const wrapper = getWrapper();
        await nextTick();
        const summaryContainer = wrapper.find(".wodin-plot-data-summary");
        const linesSummaries = summaryContainer.findAll(".wodin-plot-data-summary-lines");
        expect(linesSummaries.length).toBe(1);
        const lineSummary = linesSummaries[0];
        expect(lineSummary.attributes("name")).toBe("test lines");
        expect(lineSummary.attributes("count")).toBe("3");
        expect(lineSummary.attributes("xmin")).toBe("0");
        expect(lineSummary.attributes("xmax")).toBe("20");
        expect(lineSummary.attributes("ymin")).toBe("7");
        expect(lineSummary.attributes("ymax")).toBe("9");
        expect(lineSummary.attributes("linedash")).toBe("3");
        expect(lineSummary.attributes("linecolor")).toBe("#ff00ff");

        const pointSummaries = summaryContainer.findAll(".wodin-plot-data-summary-points");
        expect(pointSummaries.length).toBe(2);
        const pointSummary1 = pointSummaries[0];
        expect(pointSummary1.attributes("name")).toBe("test points");
        expect(pointSummary1.attributes("x")).toBe("1");
        expect(pointSummary1.attributes("y")).toBe("3");
        expect(pointSummary1.attributes("pointcolor")).toBe("#ff0000");
        const pointSummary2 = pointSummaries[1];
        expect(pointSummary2.attributes("name")).toBe("test points");
        expect(pointSummary2.attributes("x")).toBe("2");
        expect(pointSummary2.attributes("y")).toBe("4");
        expect(pointSummary2.attributes("pointcolor")).toBe("#ff0000");
    });

    it("renders nothing if no data or empty data", async () => {
        const emptyWrapper = shallowMount(WodinPlotDataSummary, {
            props: { data: { lines: [], points: [] } }
        });
        await nextTick();
        expect(emptyWrapper.find("div").exists()).toBe(false);

        const nullWrapper = shallowMount(WodinPlotDataSummary, {});
        await nextTick();
        expect(nullWrapper.find("div").exists()).toBe(false);
    });
});
