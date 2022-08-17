// Mock the import of plotly so we can mock Plotly methods
import {BasicState} from "../../../../src/app/store/basic/state";
import Vuex from "vuex";
import {mockBasicState} from "../../../mocks";
import {SensitivityPlotExtreme, SensitivityPlotType} from "../../../../src/app/store/sensitivity/state";
import {SensitivityMutation} from "../../../../src/app/store/sensitivity/mutations";
import SensitivitySummaryPlot from "../../../../src/app/components/sensitivity/SensitivitySummaryPlot.vue";
import {shallowMount} from "@vue/test-utils";
import * as plotly from "plotly.js";

jest.mock("plotly.js", () => ({
    newPlot: jest.fn(),
    Plots: {
        resize: jest.fn()
    }
}));

describe("SensitivitySummaryPlot", () => {
    const mockPlotlyNewPlot = jest.spyOn(plotly, "newPlot");

    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    function mockResizeObserver(this: any) {
        this.observe = mockObserve;
        this.disconnect = mockDisconnect;
    }
    (global.ResizeObserver as any) = mockResizeObserver;

    const mockSetPlotTime = jest.fn();

    const mockValueAtTimeData = {
        names: ["S", "I"],
        x: [1, 1.1],
        y: [[10, 10.1], [20, 19.9]]
    };

    const mockValueAtTime = jest.fn().mockReturnValue(mockValueAtTimeData);

    const getWrapper = () => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        paletteModel: {
                            S: "#ff0000",
                            I: "#0000ff"
                        },
                        endTime: 100
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        batch: {
                            valueAtTime: mockValueAtTime
                        },
                        plotSettings: {
                            plotType: SensitivityPlotType.ValueAtTime,
                            time: 99,
                            extreme: SensitivityPlotExtreme.Min
                        }
                    },
                    mutations: {
                        [SensitivityMutation.SetPlotTime]: mockSetPlotTime
                    }
                }
            }
        });

        return shallowMount(SensitivitySummaryPlot, {
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("plots data as expected", () => {
        const wrapper = getWrapper();
        expect(mockPlotlyNewPlot).toHaveBeenCalledTimes(1);
        const plotEl = wrapper.find(".plot").element;
        expect(mockPlotlyNewPlot.mock.calls[0][0]).toBe(plotEl);
        const expectedPlotData = [
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2
                },
                name: "S",
                x: [1, 1.1],
                y: [10, 10.1],
                legendgroup: undefined,
                showlegend: true
            },
            {
                mode: "lines",
                line: {
                    color: "#0000ff",
                    width: 2
                },
                name: "I",
                x: [1, 1.1],
                y: [20, 19.9],
                legendgroup: undefined,
                showlegend: true
            }
        ];
        expect(mockPlotlyNewPlot.mock.calls[0][1]).toStrictEqual(expectedPlotData);
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual({
            margin: {
                t: 25
            }
        });
        expect(mockPlotlyNewPlot.mock.calls[0][3]).toStrictEqual({responsive: true});
    });

    //it("renders as expected when no data
});
