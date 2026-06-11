import { GraphsMutation, mutations } from "../../../../src/store/graphs/mutations";
import { DataType, defaultGraphConfig, GraphsState } from "../../../../src/store/graphs/state";
import { mockGraphsState } from "../../../mocks";

export const getState = () => {
    const firstGraphCfg = defaultGraphConfig("123");
    firstGraphCfg.selectedVariables.push("S");

    const secondGraphCfg = defaultGraphConfig("456");
    secondGraphCfg.selectedVariables.push("I");

    const thirdGraphCfg = defaultGraphConfig("789");
    thirdGraphCfg.selectedVariables.push("R");

    const state: GraphsState = mockGraphsState({
        configs: [ firstGraphCfg, secondGraphCfg, thirdGraphCfg ],
        configGroups: {
            cfgGroup1: { configIds: ["123", "456"], syncProperties: ["lockYAxis"] }
        },
        graphGroups: {
            graph1: { configGroupId: "cfgGroup1", dataType: DataType.Run }
        },
        visibleData: {
            graph1: [
                { configId: "123", data: {} as any },
                { configId: "456", data: {} as any },
            ]
        }
    });

    return state;
};

describe("Graphs mutations", () => {
    it("can add config", () => {
        const state = getState();
        mutations[GraphsMutation.AddConfig](state, "111");

        expect(state.configs.at(-1)!.id).toBe("111");
    });

    it("can update config with synced properties", () => {
        const state = getState();
        mutations[GraphsMutation.UpdateConfig](state, {
            id: "123", value: { lockYAxis: true }
        });

        expect(state.configs.find(c => c.id === "123")!.lockYAxis).toBe(true);
        expect(state.configs.find(c => c.id === "456")!.lockYAxis).toBe(true);
    });

    it("can delete config", () => {
        const state = getState();
        mutations[GraphsMutation.DeleteConfig](state, "123");

        expect(state.configs.find(c => c.id === "123")).toBeUndefined();
        expect(state.configGroups["cfgGroup1"].configIds.find(c => c === "123")).toBeUndefined();
        expect(state.visibleData["graph1"].find(c => c.configId === "123")).toBeUndefined();
    });

    it("can update config group", () => {
        const state = getState();
        const updated = { syncProperties: ["logScaleYAxis"], configIds: ["456"] } as any;
        mutations[GraphsMutation.UpdateConfigGroup](state, {
            id: "cfgGroup1", value: updated
        });

        expect(state.configGroups["cfgGroup1"]).toStrictEqual(updated);
    });

    it("can update graph group", () => {
        const state = getState();
        const updated = { configGroupId: "cfgGroup1", dataType: DataType.Fit };
        mutations[GraphsMutation.UpdateGraphGroup](state, {
            id: "graph1", value: updated
        });

        expect(state.graphGroups["graph1"]).toStrictEqual(updated);
    });

    it("can update visible graph group", () => {
        const state = getState();
        const updated = ["graph1"];
        mutations[GraphsMutation.UpdateVisibleGraphGroups](state, updated);

        expect(state.visibleGraphGroups).toStrictEqual(updated);
    });
});
