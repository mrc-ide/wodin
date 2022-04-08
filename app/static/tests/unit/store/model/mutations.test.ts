import { mutations } from "../../../../src/app/store/model/mutations";
import { mockModelState } from "../../../mocks";

describe("Model mutations", () => {
    it("sets odin utils", () => {
        class TestHelpers {
            public name: string;
            constructor(){
                this.name = "helpers"
            }
        }

        class TestRunner {
            public name: string;
            public helpers: TestHelpers;
            constructor(helpers: TestHelpers) {
                this.name = "runner";
                this.helpers = helpers;
            }
        }

        const payload = {
            helpers: TestHelpers as any,
            runner: TestRunner as any
        };
        const state = mockModelState();

        mutations.SetOdinUtils(state, payload);
        expect(state.odinUtils!!.helpers.name).toBe("helpers");
        expect((state.odinUtils!!.runner as any).name).toBe("runner");
        expect((state.odinUtils!!.runner as any).helpers).toBe(state.odinUtils!!.helpers);
    });

    it("sets odin", () => {
        const mockOdin = {
            odin: () => {}
        };
        const state = mockModelState();

        mutations.SetOdin(state, mockOdin);
        expect(state.odin).toBe(mockOdin);
    });

    it("sets odin solution", () => {
        const mockSolution = (t0: number, t1: number) => [{x: 1, y:2}];
        const state = mockModelState();

        mutations.SetOdinSolution(state, mockSolution);
        expect(state.odinSolution).toBe(mockSolution);
    });
});
