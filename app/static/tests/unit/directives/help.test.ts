import help from "../../../src/directives/help";
import tooltip from "../../../src/directives/tooltip";

const binding = {
    instance: null,
    value: "resetCode",
    oldValue: null,
    modifiers: {},
    dir: {}
};

const el = {} as HTMLElement;

const expectedHelpString = "Revert to default code - all your changes will be lost";
describe("help directive", () => {
    it("calls tooltip mounted with help string", () => {
        const mockTooltipMounted = vi.spyOn(tooltip, "mounted").mockImplementation(() => {});
        help.mounted(el, binding);
        expect(mockTooltipMounted).toHaveBeenCalledWith(el, {
            ...binding,
            value: { content: expectedHelpString, delayMs: 500 }
        });
    });

    it("calls tooltip beforeUpdate with help string", () => {
        const mockTooltipBeforeUpdate = vi.spyOn(tooltip, "beforeUpdate").mockImplementation(() => {});
        help.beforeUpdate(el, binding);
        expect(mockTooltipBeforeUpdate).toHaveBeenCalledWith(el, {
            ...binding,
            value: { content: expectedHelpString, delayMs: 500 }
        });
    });

    it("calls tooltip beforeUnmount", () => {
        const mockTooltipBeforeUnmount = vi.spyOn(tooltip, "beforeUnmount").mockImplementation(() => {});
        help.beforeUnmount(el);
        expect(mockTooltipBeforeUnmount).toHaveBeenCalledWith(el);
    });
});
