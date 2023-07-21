import { nextTick } from "vue";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import WodinPanels from "../../../src/app/components/WodinPanels.vue";

const docAddListenerSpy = jest.spyOn(document, "addEventListener");
const docRemoveListenerSpy = jest.spyOn(document, "removeEventListener");

enum PanelsMode {
    Left, Right, Both
}

// vue test utils window width
const windowWidth = 1024;
const widthToleranceLeft = windowWidth / 8;
const widthToleranceRight = windowWidth / 4;
const windowBoundaryLeft = widthToleranceLeft;
const windowBoundaryRight = windowWidth - widthToleranceRight;

const mockPreventDefault = jest.fn();

describe("WodinPanels", () => {
    const getWrapper = () => {
        return shallowMount(WodinPanels, {
            slots: {
                left: "<div id=\"l-slot-content\">LEFT</div>",
                right: "<div id=\"r-slot-content\">RIGHT</div>"
            }
        });
    };

    const testMode = (wrapper: VueWrapper, containerClass: string, collapsibleLeft: boolean,
        collapsibleRight: boolean) => {
        const containerDiv = wrapper.find(`div.${containerClass}`);
        expect(containerDiv.exists()).toBe(true);
        expect(containerDiv.find(".wodin-right .wodin-content").isVisible()).toBe(collapsibleRight);
        expect(containerDiv.find(".wodin-left .wodin-content").isVisible()).toBe(collapsibleLeft);
        expect(containerDiv.find("#resize-panel-control").exists()).toBe(true);
    };

    const testBothMode = (wrapper: VueWrapper) => testMode(wrapper, "wodin-mode-both", true, true);

    const expectDragMoveResult = (
        wrapper: VueWrapper,
        expectedMode: PanelsMode,
        expectedPreventDefault: number,
        position: number | null = null
    ) => {
        const {
            mode,
            modeClass,
            panelWidth,
            plotWidth
        } = (wrapper.vm as any);
        const modeClassMap: Record<PanelsMode, string> = {
            [PanelsMode.Both]: "wodin-mode-both",
            [PanelsMode.Left]: "wodin-mode-left",
            [PanelsMode.Right]: "wodin-mode-right"
        };
        expect(mode).toBe(expectedMode);
        expect(modeClass).toBe(modeClassMap[expectedMode]);
        if (position) {
            expect(panelWidth).toStrictEqual({ width: `calc(${position}px + 1.4rem)` });
            expect(plotWidth).toStrictEqual({ width: `calc(100vw - ${position}px - 5rem)` });
        }
        expect(mockPreventDefault).toBeCalledTimes(expectedPreventDefault);
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    const mouseMove = (wrapper: VueWrapper, position: number) => {
        (wrapper.vm as any).handleDragMove({
            clientX: position,
            preventDefault: mockPreventDefault
        });
    };

    const touchMove = (wrapper: VueWrapper, position: number) => {
        (wrapper.vm as any).handleDragMove({
            touches: [{ clientX: position }],
            preventDefault: mockPreventDefault
        });
    };

    it("has expected slot content", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("#wodin-content-left").html()).toContain("<div id=\"l-slot-content\">LEFT</div>");
        expect(wrapper.find("#wodin-content-right").html()).toContain("<div id=\"r-slot-content\">RIGHT</div>");
    });

    it("defaults to Both mode", () => {
        const wrapper = getWrapper();
        testBothMode(wrapper);
        expect(wrapper.find(".wodin-left").classes()).toStrictEqual(["wodin-left"]);
        expect(wrapper.find(".wodin-right").classes()).toStrictEqual(["wodin-right"]);
    });

    it("handleDragStart adds correct listeners", () => {
        const wrapper = getWrapper();
        (wrapper.vm as any).handleDragStart();
        const { handleDragMove, handleDragEnd } = (wrapper.vm as any);
        expect(docAddListenerSpy).toHaveBeenCalledTimes(4);
        expect(docAddListenerSpy.mock.calls[0][0]).toBe("mousemove");
        expect(docAddListenerSpy.mock.calls[0][1]).toBe(handleDragMove);
        expect(docAddListenerSpy.mock.calls[1][0]).toBe("touchmove");
        expect(docAddListenerSpy.mock.calls[1][1]).toBe(handleDragMove);
        expect(docAddListenerSpy.mock.calls[2][0]).toBe("mouseup");
        expect(docAddListenerSpy.mock.calls[2][1]).toBe(handleDragEnd);
        expect(docAddListenerSpy.mock.calls[3][0]).toBe("touchend");
        expect(docAddListenerSpy.mock.calls[3][1]).toBe(handleDragEnd);
        expect(docRemoveListenerSpy).toHaveBeenCalledTimes(0);
    });

    it("handleDragEnd removes correct listeners", () => {
        const wrapper = getWrapper();
        (wrapper.vm as any).handleDragEnd();
        const { handleDragMove, handleDragEnd } = (wrapper.vm as any);
        expect(docRemoveListenerSpy).toHaveBeenCalledTimes(4);
        expect(docRemoveListenerSpy.mock.calls[0][0]).toBe("mousemove");
        expect(docRemoveListenerSpy.mock.calls[0][1]).toBe(handleDragMove);
        expect(docRemoveListenerSpy.mock.calls[1][0]).toBe("touchmove");
        expect(docRemoveListenerSpy.mock.calls[1][1]).toBe(handleDragMove);
        expect(docRemoveListenerSpy.mock.calls[2][0]).toBe("mouseup");
        expect(docRemoveListenerSpy.mock.calls[2][1]).toBe(handleDragEnd);
        expect(docRemoveListenerSpy.mock.calls[3][0]).toBe("touchend");
        expect(docRemoveListenerSpy.mock.calls[3][1]).toBe(handleDragEnd);
        expect(docAddListenerSpy).toHaveBeenCalledTimes(0);
    });

    it("handleDragMove works as expected with mouseevents", async () => {
        const wrapper = getWrapper();
        expectDragMoveResult(wrapper, PanelsMode.Both, 0);
        mouseMove(wrapper, windowBoundaryLeft);
        expectDragMoveResult(wrapper, PanelsMode.Both, 1, windowBoundaryLeft);
        mouseMove(wrapper, windowBoundaryLeft - 1);
        expectDragMoveResult(wrapper, PanelsMode.Right, 2, windowBoundaryLeft - 1);
        mouseMove(wrapper, windowBoundaryRight);
        expectDragMoveResult(wrapper, PanelsMode.Both, 3, windowBoundaryRight);
        mouseMove(wrapper, windowBoundaryRight + 1);
        expectDragMoveResult(wrapper, PanelsMode.Left, 4, windowBoundaryRight + 1);
    });

    it("handleDragMove works as expected with touchevents", async () => {
        const wrapper = getWrapper();
        expectDragMoveResult(wrapper, PanelsMode.Both, 0);
        touchMove(wrapper, windowBoundaryLeft);
        expectDragMoveResult(wrapper, PanelsMode.Both, 1, windowBoundaryLeft);
        touchMove(wrapper, windowBoundaryLeft - 1);
        expectDragMoveResult(wrapper, PanelsMode.Right, 2, windowBoundaryLeft - 1);
        touchMove(wrapper, windowBoundaryRight);
        expectDragMoveResult(wrapper, PanelsMode.Both, 3, windowBoundaryRight);
        touchMove(wrapper, windowBoundaryRight + 1);
        expectDragMoveResult(wrapper, PanelsMode.Left, 4, windowBoundaryRight + 1);
    });

    it("clicking on 'View Options' switches mode as expected", async () => {
        const wrapper = getWrapper();
        (wrapper.vm as any).mode = PanelsMode.Right;
        await nextTick();
        await wrapper.find(".view-left").trigger("click");
        testBothMode(wrapper);
    });

    it("clicking on 'View Charts' switches mode as expected", async () => {
        const wrapper = getWrapper();
        (wrapper.vm as any).mode = PanelsMode.Left;
        await nextTick();
        await wrapper.find(".view-right").trigger("click");
        testBothMode(wrapper);
    });
});
