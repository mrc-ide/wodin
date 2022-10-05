import { SessionsMutation, mutations } from "../../../../src/app/store/sessions/mutations";

describe("Sessions mutations", () => {
    it("sets sessions metadata", () => {
        const state = { sessionsMetadata: null };
        const metadata = [{ id: "123", time: "09:00", label: null }];
        mutations[SessionsMutation.SetSessionsMetadata](state, metadata);
        expect(state.sessionsMetadata).toBe(metadata);
    });

    it("sets session friendly id", () => {
        const state = {
            sessionsMetadata: [
                {
                    id: "123", date: "", label: null, friendlyId: null
                },
                {
                    id: "456", date: "", label: "label1", friendlyId: null
                }
            ]
        } as any;
        const payload = { sessionId: "456", friendlyId: "happy-hog" };
        mutations[SessionsMutation.SetSessionFriendlyId](state, payload);
        expect(state.sessionsMetadata).toStrictEqual([
            {
                id: "123", date: "", label: null, friendlyId: null
            },
            {
                id: "456", date: "", label: "label1", friendlyId: "happy-hog"
            }
        ]);
    });

    it("SetSessionFriendlyId does nothing if session metadata not found", () => {
        const sessionsMetadata = [
            {
                id: "123", date: "", label: null, friendlyId: null
            }
        ];
        // this shouldn't happen!
        const state = { sessionsMetadata } as any;
        const payload = { sessionId: "456", friendlyId: "happy-hog" };
        mutations[SessionsMutation.SetSessionFriendlyId](state, payload);
        expect(state.sessionsMetadata).toStrictEqual(sessionsMetadata);
    });
});
