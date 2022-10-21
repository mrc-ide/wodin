import { actions, VersionsAction } from "../../../../src/app/store/versions/actions";
import { mockAxios, mockSuccess } from "../../../mocks";

const versions = {
    dfoptim: "0.0.5",
    dopri: "0.0.12",
    odin: "1.3.14",
    "odin.api": "0.1.6",
    odinjs: "0.0.14"
};
describe("versions actions", () => {
    it("gets versions", async () => {
        mockAxios.onGet("/odin/versions")
            .reply(200, mockSuccess(versions));

        const commit = jest.fn();
        await (actions[VersionsAction.GetVersions] as any)({ commit, rootState: { baseUrl: "" } });
        expect(mockAxios.history.get[0].url).toBe("/odin/versions");
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe("SetVersions");
    });
});
