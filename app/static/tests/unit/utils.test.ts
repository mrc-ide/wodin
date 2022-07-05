import { evaluateScript, freezer, processFitData } from "../../src/app/utils";

describe("freezer", () => {
    it("deep freezes an object", () => {
        const data = {
            nothing: null,
            time: 10,
            name: "hello",
            items: [1, null, "three", { label: "l1" }],
            child: {
                name: "child",
                items: [4, null, "five"]
            }
        };

        const frozen = freezer.deepFreeze({ ...data }) as any;
        expect(frozen).toStrictEqual(data);
        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.items)).toBe(true);
        expect(Object.isFrozen(frozen.child)).toBe(true);
        expect(Object.isFrozen(frozen.child.items)).toBe(true);
    });

    it("deep freezes an array", () => {
        const data = [{ id: 1 }, { child: { id: 2 } }, 1, "hi"];

        const frozen = freezer.deepFreeze([...data]) as any;
        expect(frozen).toStrictEqual(data);
        expect(Object.isFrozen(frozen[0])).toBe(true);
        expect(Object.isFrozen(frozen[1].child)).toBe(true);
    });
});

describe("evaluateScript", () => {
    it("evals as type", () => {
        const fn = evaluateScript<(n: number) => number>("(n) => n+3");
        expect(fn(2)).toBe(5);
    });
});

describe("processFitData", () => {
    it("processes numeric data without errors", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3.5", b: "-100" },
            { a: "5", b: "6" },
            { a: "7", b: "8" },
            { a: "9", b: "10"}
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.error).toBe(null);
        expect(result.data).toStrictEqual([
            { a: 1, b: 2 },
            { a: 3.5, b: -100 },
            { a: 5, b: 6 },
            { a: 7, b: 8 },
            { a: 9, b: 10 }
        ]);
        expect(result.timeVariableCandidates).toStrictEqual(["a"]);
    });

    it("returns error if less than 5 rows", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3.5", b: "-100" },
            { a: "5", b: "6" },
            { a: "7", b: "8" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "File must contain at least 5 data rows"
        });
    });



    it("returns error with 3 or fewer non-numeric values", () => {
        const data = [
            { a: "one", b: "two" },
            { a: "3", b: "4" },
            { a: "5", b: "six" },
            { a: "7", b: "8" },
            { a: "9", b: "10"}
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "Data contains non-numeric values: 'one', 'two', 'six'"
        });
    });

    it("returns error with first 3 non-numeric values if there are more than this", () => {
        const data = [
            { a: "one", b: "two" },
            { a: "3", b: "four" },
            { a: "5", b: "six" },
            { a: "7", b: "8" },
            { a: "9", b: "10"}
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "Data contains non-numeric values: 'one', 'two', 'four' and more"
        });
    });

    it("returns error if no candidate time variables", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3", b: "4" },
            { a: "5", b: "6" },
            { a: "7", b: "5" },
            { a: "-21", b: "10"}
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "Data contains no suitable time variable. A time variable must strictly increase per row."
        });
    });
});
