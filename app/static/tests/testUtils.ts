export const fileTimeout = 20;

export const expectCloseNumericArray = (actual: number[], expected: number[]) => {
    expect(actual.length).toBe(expected.length);
    actual.forEach((value, idx) => {
        expect(value).toBeCloseTo(expected[idx]);
    });
};
