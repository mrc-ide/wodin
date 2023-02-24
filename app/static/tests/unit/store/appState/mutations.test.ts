import { appStateMutations } from "../../../../src/app/store/appState/mutations";
import { VisualisationTab } from "../../../../src/app/store/appState/state";
import { mockBasicState } from "../../../mocks";

describe("AppState mutations", () => {
    it("Sets app", () => {
        const state = {
            appType: "test",
            appName: null,
            baseUrl: null,
            language: {
                currentLanguage: null,
                internationalisation: null,
                updatingLanguage: null
            }
        } as any;
        appStateMutations.SetApp(state, {
            appName: "Test Name",
            baseUrl: "http://localhost:3000",
            defaultLanguage: "en",
            internationalisation: true
        });
        expect(state.appName).toBe("Test Name");
        expect(state.baseUrl).toBe("http://localhost:3000");
        expect(state.language.currentLanguage).toBe("en");
        expect(state.language.internationalisation).toBe(true);
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

    it("clears queued state upload", () => {
        const spyClearInterval = jest.spyOn(window, "clearInterval");
        const state = mockBasicState({ queuedStateUploadIntervalId: 99 });
        appStateMutations.ClearQueuedStateUpload(state);
        expect(state.queuedStateUploadIntervalId).toBe(-1);
        expect(spyClearInterval).toHaveBeenCalledWith(99);
    });

    it("sets queued state upload", () => {
        const state = mockBasicState();
        appStateMutations.SetQueuedStateUpload(state, 99);
        expect(state.queuedStateUploadIntervalId).toBe(99);
    });

    it("sets state upload in progress", () => {
        const state = mockBasicState();
        appStateMutations.SetStateUploadInProgress(state, true);
        expect(state.stateUploadInProgress).toBe(true);
    });

    it("sets session label", () => {
        const state = mockBasicState();
        appStateMutations.SetSessionLabel(state, "new session label");
        expect(state.sessionLabel).toBe("new session label");
    });

    it("sets configured", () => {
        const state = mockBasicState();
        appStateMutations.SetConfigured(state);
        expect(state.configured).toBe(true);
    });
});
