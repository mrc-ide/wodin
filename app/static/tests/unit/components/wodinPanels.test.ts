import { nextTick } from "vue";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import WodinPanels from "../../../src/app/components/WodinPanels.vue";

const docAddListenerSpy = jest.spyOn(document, "addEventListener");
const docRemoveListenerSpy = jest.spyOn(document, "removeEventListener");

enum PanelsMode {
    Left, Right, Both
}

const modeClassMap: Record<PanelsMode, string> = {
    [PanelsMode.Both]: "wodin-mode-both",
    [PanelsMode.Left]: "wodin-mode-left",
    [PanelsMode.Right]: "wodin-mode-right"
};

enum HidePanelContent {
    Left, Right, None
}

enum DragStart {
    Icon, Edge
}

// vue test utils window width
const windowWidth = 1024;
const widthToleranceLeft = windowWidth / 8;
const widthToleranceRight = windowWidth / 4;
const windowBoundaryLeft = widthToleranceLeft;
const windowBoundaryRight = windowWidth - widthToleranceRight;
const snapToleranceLeft = windowWidth / 25;
const snapToleranceRight = windowWidth - windowWidth / 13;

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
        expectedHideContent: HidePanelContent,
        expectedPreventDefault: number,
        dragStart: DragStart,
        position: number | null = null
    ) => {
        const {
            mode,
            modeClass,
            optionsWidth,
            chartsWidth,
            hidePanelMode
        } = (wrapper.vm as any);
        expect(mode).toBe(expectedMode);
        expect(modeClass).toBe(modeClassMap[expectedMode]);
        expect(hidePanelMode).toBe(expectedHideContent);
        if (position) {
            expect(optionsWidth)
                .toStrictEqual({ width: `calc(${position}px + ${dragStart === DragStart.Icon ? 1.4 : -1}rem)` });
            expect(chartsWidth)
                .toStrictEqual({ width: `calc(100vw - ${position}px - ${dragStart === DragStart.Icon ? 5 : 7.4}rem)` });
        }
        expect(mockPreventDefault).toBeCalledTimes(expectedPreventDefault);
    };

    const expectDragMoveEndResult = (
        wrapper: VueWrapper,
        expectedMode: PanelsMode
    ) => {
        const {
            mode,
            modeClass,
            dragStart
        } = (wrapper.vm as any);
        expect(mode).toBe(expectedMode);
        expect(modeClass).toBe(modeClassMap[expectedMode]);
        expect(dragStart).toBe(null);
    };

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

    const mouseMoveEnd = (wrapper: VueWrapper, position: number) => {
        (wrapper.vm as any).handleDragEnd({
            clientX: position,
            preventDefault: mockPreventDefault
        });
    };

    const touchMoveEnd = (wrapper: VueWrapper, position: number) => {
        (wrapper.vm as any).handleDragEnd({
            touches: [{ clientX: position }],
            preventDefault: mockPreventDefault
        });
    };

    const expectResizeBoundaries = (dragStart: DragStart, moveType: typeof mouseMove | typeof touchMove) => {
        const wrapper = getWrapper();
        (wrapper.vm as any).dragStart = dragStart;
        expectDragMoveResult(wrapper, PanelsMode.Both, HidePanelContent.None, 0, dragStart);
        moveType(wrapper, windowBoundaryLeft);
        expectDragMoveResult(wrapper, PanelsMode.Both, HidePanelContent.None, 1, dragStart, windowBoundaryLeft);
        moveType(wrapper, windowBoundaryLeft - 1);
        expectDragMoveResult(wrapper, PanelsMode.Both, HidePanelContent.Left, 2, dragStart, windowBoundaryLeft - 1);
        moveType(wrapper, snapToleranceLeft - 1);
        expectDragMoveResult(wrapper, PanelsMode.Right, HidePanelContent.Left, 3, dragStart, snapToleranceLeft - 1);
        moveType(wrapper, windowBoundaryRight);
        expectDragMoveResult(wrapper, PanelsMode.Both, HidePanelContent.None, 4, dragStart, windowBoundaryRight);
        moveType(wrapper, windowBoundaryRight + 1);
        expectDragMoveResult(wrapper, PanelsMode.Both, HidePanelContent.Right, 5, dragStart, windowBoundaryRight + 1);
        moveType(wrapper, snapToleranceRight + 1);
        expectDragMoveResult(wrapper, PanelsMode.Left, HidePanelContent.Right, 6, snapToleranceRight + 1);
    };

    const expectResizeBoundariesEnd = (moveType: typeof mouseMoveEnd | typeof touchMoveEnd) => {
        const wrapper = getWrapper();
        const dragStart = DragStart.Edge;
        (wrapper.vm as any).dragStart = dragStart;
        moveType(wrapper, windowWidth / 2);
        expectDragMoveEndResult(wrapper, PanelsMode.Both);
        moveType(wrapper, windowBoundaryLeft);
        expectDragMoveEndResult(wrapper, PanelsMode.Both);
        moveType(wrapper, windowBoundaryLeft - 1);
        expectDragMoveEndResult(wrapper, PanelsMode.Right);
        moveType(wrapper, windowBoundaryRight);
        expectDragMoveEndResult(wrapper, PanelsMode.Both);
        moveType(wrapper, windowBoundaryRight + 1);
        expectDragMoveEndResult(wrapper, PanelsMode.Left);
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

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
        (wrapper.vm as any).handleDragEnd({
            clientX: windowWidth / 2,
            preventDefault: mockPreventDefault
        });
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

    it("handleDragMove works as expected", () => {
        expectResizeBoundaries(DragStart.Icon, mouseMove);
        mockPreventDefault.mockClear();
        expectResizeBoundaries(DragStart.Icon, touchMove);
        mockPreventDefault.mockClear();
        expectResizeBoundaries(DragStart.Edge, mouseMove);
        mockPreventDefault.mockClear();
        expectResizeBoundaries(DragStart.Edge, touchMove);
    });

    it("handleDragEnd works as expected", async () => {
        expectResizeBoundariesEnd(mouseMoveEnd);
        expectResizeBoundariesEnd(touchMoveEnd);
    });

    it("handleDragStartEdge and handleDragStartIcon work as expected", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.dragStart).toBe(null);
        wrapper.vm.handleDragStartEdge();
        expect(vm.dragStart).toBe(DragStart.Edge);
        wrapper.vm.handleDragStartIcon();
        expect(vm.dragStart).toBe(DragStart.Icon);
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
