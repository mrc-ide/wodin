import {SessionStore} from "../../src/db/sessionStore";
import Mock = jest.Mock;

jest.mock("../../src/db/sessionStore");

describe("SessionsController", () => {
    beforeEach(() => {
        (SessionStore as Mock).mockClear();
    });

    it("can save session", () => {
        // TODO: case sessionStore to mock above and use that in tests
        // expect(SessionStore).toHaveBeenCalledTimes(1);  //expect store constructor
    });
});

