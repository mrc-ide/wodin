import { appStateMutations } from "../../../../src/app/store/appState/mutations";
import { VisualisationTab } from "../../../../src/app/store/appState/state";

describe("AppState mutations", () => {
    it("Sets appName", () => {
        const state = { appType: "test", appName: null } as any;
        appStateMutations.SetAppName(state, "Test Name");
        expect(state.appName).toBe("Test Name");
    });

    it("sets config", () => {
        const state = { config: null } as any;
        const config = { basicProp: "Test value" };
        appStateMutations.SetConfig(state, config);
        expect(state.config).toBe(config);
    });

    it("sets open visualisation tab", () => {
        const state = { openVisualisationTab: VisualisationTab.Run } as any;
        appStateMutations.SetOpenVisualisationTab(state, VisualisationTab.Sensitivity);
        expect(state.openVisualisationTab).toBe(VisualisationTab.Sensitivity);
    });
});
