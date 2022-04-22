import * as dopri from "dopri";
import { mutations } from "../../../../src/app/store/model/mutations";
import { mockModelState } from "../../../mocks";

describe("Model mutations", () => {
    it("sets odin runner", () => {
        class TestRunner {
            public name: string;

            public dopri: unknown;

            constructor(dopriImpl: unknown) {
                this.name = "runner";
                this.dopri = dopriImpl;
            }
        }

        const payload = TestRunner;
        const state = mockModelState();

        mutations.SetOdinRunner(state, payload);
        expect((state.odinRunner as any).name).toBe("runner");
        expect((state.odinRunner as any).dopri).toBe(dopri);
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
        const mockSolution = (t0: number, t1: number) => [{ x: 1, y: 2 }];
        const state = mockModelState();

        mutations.SetOdinSolution(state, mockSolution);
        expect(state.odinSolution).toBe(mockSolution);
    });
});
