import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../src/store/basic/state";
import GraphSettingsComponent from "../../../src/components/GraphSettings.vue";
import { GraphsMutation } from "../../../src/store/graphs/mutations";
import { defaultGraphSettings, fitGraphId, GraphSettings, GraphsState } from "../../../src/store/graphs/state";

describe("GraphSettings", () => {
    const mockSetGraphConfig = vi.fn();

    const getWrapper = (fitGraphSettings: Partial<GraphSettings> = {}) => {
        const graphState: GraphsState = {
            fitGraphConfig: {
                id: fitGraphId,
                selectedVariables: [],
                unselectedVariables: [],
                settings: { ...defaultGraphSettings(), ...fitGraphSettings }
            },
            config: []
        };
        const store = new Vuex.Store<BasicState>({
            modules: {
                graphs: {
                    namespaced: true,
                    state: graphState,
                    mutations: {
                        [GraphsMutation.SetGraphConfig]: mockSetGraphConfig,
                    }
                }
            }
        });

        return shallowMount(GraphSettingsComponent, {
            props: { graphConfig: graphState.fitGraphConfig },
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper({ lockYAxis: true, logScaleYAxis: true });
        const labels = wrapper.findAll("label");
        const inputs = wrapper.findAll("input");
        expect(labels.length).toBe(2);
        expect(inputs.length).toBe(2);
        expect(labels[0].text()).toBe("Log scale y axis");
        expect(inputs[0].attributes("type")).toBe("checkbox");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
        expect(labels[1].text()).toBe("Lock y axis");
        expect(inputs[1].attributes("type")).toBe("checkbox");
        expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
    });

    it("commits change to log scale y axis setting", async () => {
        const wrapper = getWrapper();
        const inputs = wrapper.findAll("input");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        await inputs[0].setValue(true);
        expect(mockSetGraphConfig.mock.calls[0][1]).toStrictEqual({
            id: fitGraphId,
            settings: { logScaleYAxis: true, yAxisRange: null }
        });
    });

    it("commits change to lock y axis setting", async () => {
        const wrapper = getWrapper();
        const inputs = wrapper.findAll("input");
        expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
        await inputs[1].setValue(true);
        expect(mockSetGraphConfig.mock.calls[0][1]).toStrictEqual({
            id: fitGraphId,
            settings: { lockYAxis: true }
        });
    });
});
