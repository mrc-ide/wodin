import {AppStateGetter, getters} from "../../../../src/app/store/appState/getters";
import {mockBasicState} from "../../../mocks";

describe("AppState getters", () => {
    const expectBaseUrlPathForBaseUrl = (baseUrl: string, expectedBasePath: string) => {
        const state = mockBasicState({baseUrl});
        expect((getters.baseUrlPath as any)(state)).toBe(expectedBasePath);
    };

    it("can get base path from baseUrl", () => {
        expectBaseUrlPathForBaseUrl("http://localhost:3000", "");
        expectBaseUrlPathForBaseUrl("http://localhost:3000/testInstance", "testInstance");
        expectBaseUrlPathForBaseUrl("http://localhost:3000/top/testInstance", "top/testInstance");
    });
});
