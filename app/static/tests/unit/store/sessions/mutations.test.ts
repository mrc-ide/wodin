import { SessionsMutation, mutations } from "../../../../src/app/store/sessions/mutations";

describe("Sessions mutations", () => {
    it("sets sessions metadata", () => {
        const state = {sessionsMetadata: null};
        const metadata = [{id: "123", time: "09:00", label: null}];
        mutations[SessionsMutation.SetSessionsMetadata](state, metadata);
        expect(state.sessionsMetadata).toBe(metadata);
    });
});
