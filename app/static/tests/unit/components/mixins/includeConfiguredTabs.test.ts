import Vuex from "vuex";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState } from "../../../mocks";
import includeConfiguredTabs from "../../../../src/components/mixins/includeConfiguredTabs";

describe("includeConfiguredTabs mixin", () => {
    const getStore = (helpConfig: any, multiSensitivity: boolean | undefined = undefined) => {
        return new Vuex.Store<BasicState>({
            state: mockBasicState({
                config: {
                    multiSensitivity,
                    help: helpConfig
                } as any
            })
        });
    };

    it("returns help tab name from store", () => {
        const store = getStore({
            markdown: ["test md"],
            tabName: "Help"
        });

        const result = includeConfiguredTabs(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe("Help");
        expect(result.multiSensitivityTabName.value).toBe(null);
        expect(result.rightTabNames.value).toStrictEqual(["Help", "Run", "Sensitivity"]);
    });

    it("returns default help tab name", () => {
        const store = getStore(
            {
                markdown: ["test md"]
            },
            false
        );

        const result = includeConfiguredTabs(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe("Explanation");
        expect(result.multiSensitivityTabName.value).toBe(null);
        expect(result.rightTabNames.value).toStrictEqual(["Explanation", "Run", "Sensitivity"]);
    });

    it("returns no help tab name if no help markdown in store", () => {
        const store = getStore({
            tabName: "not used"
        });

        const result = includeConfiguredTabs(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe(null);
        expect(result.multiSensitivityTabName.value).toBe(null);
        expect(result.rightTabNames.value).toStrictEqual(["Run", "Sensitivity"]);
    });

    it("includes multi-sensitivity tab name if configured", () => {
        const store = getStore({}, true);
        const result = includeConfiguredTabs(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe(null);
        expect(result.multiSensitivityTabName.value).toBe("Multi-sensitivity");
        expect(result.rightTabNames.value).toStrictEqual(["Run", "Sensitivity", "Multi-sensitivity"]);
    });

    it("includes both help and multi-sensitivity tab names if configured", () => {
        const store = getStore(
            {
                markdown: ["test md"],
                tabName: "Help"
            },
            true
        );
        const result = includeConfiguredTabs(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe("Help");
        expect(result.multiSensitivityTabName.value).toBe("Multi-sensitivity");
        expect(result.rightTabNames.value).toStrictEqual(["Help", "Run", "Sensitivity", "Multi-sensitivity"]);
    });
});
