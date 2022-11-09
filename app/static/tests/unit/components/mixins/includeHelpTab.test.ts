import Vuex from "vuex";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import includeHelpTab from "../../../../src/app/components/mixins/includeHelpTab";

describe("includeHelpTab mixin", () => {
    const getStore = (helpConfig: any) => {
        return new Vuex.Store<BasicState>({
            state: mockBasicState({
                config: {
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

        const result = includeHelpTab(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe("Help");
        expect(result.rightTabNames.value).toStrictEqual(["Help", "Run", "Sensitivity"]);
    });

    it("returns default help tab name", () => {
        const store = getStore({
            markdown: ["test md"]
        });

        const result = includeHelpTab(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe("Explanation");
        expect(result.rightTabNames.value).toStrictEqual(["Explanation", "Run", "Sensitivity"]);
    });

    it("returns no help tab name if no help markdown in store", () => {
        const store = getStore({
            tabName: "not used"
        });

        const result = includeHelpTab(store, ["Run", "Sensitivity"]);
        expect(result.helpTabName.value).toBe(null);
        expect(result.rightTabNames.value).toStrictEqual(["Run", "Sensitivity"]);
    });
});
