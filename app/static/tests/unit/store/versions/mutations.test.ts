import { mutations, VersionsMutation } from "../../../../src/app/store/versions/mutations";

describe("versions mutations", () => {
    it("can set versions", () => {
        const state = {
            versions: null
        };
        const versionsPayload = {
            dfoptim: "0.0.5",
            dopri: "0.0.12",
            odin: "1.3.14",
            "odin.api": "0.1.6",
            odinjs: "0.0.14"
        };
        mutations[VersionsMutation.SetVersions](state, versionsPayload);

        expect(state.versions).toBe(versionsPayload);
    });
});
