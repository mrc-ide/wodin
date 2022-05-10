import { registerViews } from "../../src/server/views";

const hbs = require("hbs");

describe("views", () => {
    const realRegHelper = hbs.registerHelper;
    const mockRegHelper = jest.fn();

    beforeAll(() => {
        hbs.registerHelper = mockRegHelper;
    });

    afterAll(() => {
        hbs.registerHelper = realRegHelper;
    });

    it("register views sets app values and registers helper", () => {
        const mockApp = {
            set: jest.fn()
        } as any;
        registerViews(mockApp, "/testRoot");
        expect(mockApp.set).toBeCalledTimes(2);
        expect(mockApp.set.mock.calls[0][0]).toBe("view engine");
        expect(mockApp.set.mock.calls[0][1]).toBe("hbs");
        expect(mockApp.set.mock.calls[1][0]).toBe("views");
        expect(mockApp.set.mock.calls[1][1]).toBe("/testRoot/views");

        expect(mockRegHelper).toBeCalledTimes(1);
        expect(mockRegHelper.mock.calls[0][0]).toBe("json");
        const jsonHelper = mockRegHelper.mock.calls[0][1];

        // json helper should jsonify input
        expect(jsonHelper({ context: "test" })).toBe("{\"context\":\"test\"}");
    });
});
