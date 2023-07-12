import help from "../../../src/app/directives/help";
import tooltip from "../../../src/app/directives/tooltip";

const binding = {
    instance: null,
    value: "resetCode",
    oldValue: null,
    modifiers: {},
    dir: {}
};

const el = {} as HTMLElement;

const expectedHelpString = "Revert to default code - all your changes will be lo st";
describe("help directive", () => {
    it("calls tooltip mounted with help string", () => {
        const mockTooltipMounted = jest.spyOn(tooltip, "mounted").mockImplementation(() => {});
        help.mounted(el, binding);
        expect(mockTooltipMounted).toHaveBeenCalledWith(el, { ...binding, value: expectedHelpString });
    });

    it("calls tooltip beforeUpdate with help string", () => {
        const mockTooltipBeforeUpdate = jest.spyOn(tooltip, "beforeUpdate").mockImplementation(() => {});
        help.beforeUpdate(el, binding);
        expect(mockTooltipBeforeUpdate).toHaveBeenCalledWith(el, { ...binding, value: expectedHelpString });
    });

    it("calls tooltip beforeUnmount", () => {
        const mockTooltipBeforeUnmount = jest.spyOn(tooltip, "beforeUnmount").mockImplementation(() => {});
        help.beforeUnmount(el);
        expect(mockTooltipBeforeUnmount).toHaveBeenCalledWith(el);
    });
});
