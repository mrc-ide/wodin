import { mount, shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import { nextTick } from "vue";
import DraggableDialog from "../../../../src/app/components/help/DraggableDialog.vue";

const docAddListenerSpy = jest.spyOn(document, "addEventListener");
const docRemoveListenerSpy = jest.spyOn(document, "removeEventListener");
const winAddListenerSpy = jest.spyOn(window, "addEventListener");

describe("DraggableDialog", () => {
    const getWrapper = () => {
        return mount(DraggableDialog, {
            slots: {
                default: "<h1>TEST SLOT CONTENT</h1>"
            },
            props: {
                title: "Test Dialog Title"
            }
        });
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".move").text()).toBe("Test Dialog Title");
        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.at(0)!.props("type")).toBe("move");
        expect(icons.at(1)!.props("type")).toBe("x");
        expect(wrapper.find("div.draggable-content h1").text()).toBe("TEST SLOT CONTENT");
    });

    const testHandlesDrag = async (touch = false, moveTo = { x: 15, y: 28 },
        expectedEndPosition = { x: 5, y: 8 }) => {
        const wrapper = getWrapper();

        // Start drag
        const startEvent = touch ? "touchstart" : "mousedown";
        await wrapper.find(".dragtarget").trigger(startEvent, { clientX: 10, clientY: 20 });
        expect(docAddListenerSpy).toHaveBeenCalledTimes(4);
        expect(docAddListenerSpy.mock.calls[0][0]).toBe("mousemove");
        expect(docAddListenerSpy.mock.calls[1][0]).toBe("touchmove");
        expect(docAddListenerSpy.mock.calls[2][0]).toBe("mouseup");
        expect(docAddListenerSpy.mock.calls[3][0]).toBe("touchend");
        expect(docRemoveListenerSpy).toHaveBeenCalledTimes(0);

        expect((wrapper.vm as any).moveClientStart).toStrictEqual({ x: 10, y: 20 });
        // vue test-utils gives bounding rect of 0 for all elements so we'll have initialised position to 0,0
        expect((wrapper.vm as any).movePositionStart).toStrictEqual({ x: 0, y: 0 });

        // Move
        const moveHandlerIndex = touch ? 1 : 0; // touchmove or mousemove
        const moveHandler = docAddListenerSpy.mock.calls[moveHandlerIndex][1] as any;
        const moveEvent = {
            clientX: moveTo.x,
            clientY: moveTo.y,
            preventDefault: jest.fn()
        };
        moveHandler(moveEvent);
        expect((wrapper.vm as any).position).toStrictEqual(expectedEndPosition);
        expect(moveEvent.preventDefault).toHaveBeenCalledTimes(1);

        // End drag
        const endHandlerIndex = touch ? 3 : 2; // touchend or mouseup
        const mouseUpHandler = docAddListenerSpy.mock.calls[endHandlerIndex][1] as any;
        const mouseUpEvent = { preventDefault: jest.fn() };
        mouseUpHandler(mouseUpEvent);
        expect(docRemoveListenerSpy).toHaveBeenCalledTimes(4);
        expect(docRemoveListenerSpy.mock.calls[0][0]).toBe("mousemove");
        expect(docRemoveListenerSpy.mock.calls[1][0]).toBe("touchmove");
        expect(docRemoveListenerSpy.mock.calls[2][0]).toBe("mouseup");
        expect(docRemoveListenerSpy.mock.calls[3][0]).toBe("touchend");
        expect(mouseUpEvent.preventDefault).toHaveBeenCalledTimes(1);

        await nextTick();

        const dialogElement = wrapper.find(".draggable-dialog").element as HTMLElement;
        expect(dialogElement.style.top).toBe(`${expectedEndPosition.y}px`);
        expect(dialogElement.style.left).toBe(`${expectedEndPosition.x}px`);
    };

    it("handles mouse drag", () => {
        testHandlesDrag();
    });

    it("handles touch drag", () => {
        testHandlesDrag(true);
    });

    it("contains drag within viewport", () => {
        testHandlesDrag(false, { x: -30, y: -40 }, { x: 0, y: 0 });
    });

    it("emits close event when click x", async () => {
        const wrapper = getWrapper();
        const x = wrapper.findAllComponents(VueFeather).at(1)!;
        expect(x.props("type")).toBe("x");
        await x.trigger("click");
        expect(wrapper.emitted("close")!.length).toBe(1);
    });

    it("emits close event when window is resized", () => {
        const wrapper = getWrapper();
        expect(winAddListenerSpy).toHaveBeenCalledTimes(1);
        expect(winAddListenerSpy.mock.calls[0][0]).toBe("resize");
        const resizeHandler = winAddListenerSpy.mock.calls[0][1] as any;
        resizeHandler();
        expect(wrapper.emitted("close")!.length).toBe(1);
    });

    const testHandlesResize = async (touch = false, resizeTo = { x: 200, y: 300 },
        expectedEndSize = { width: 190, height: 280 }) => {
        const wrapper = getWrapper();
        // Start resize
        const startEvent = touch ? "touchstart" : "mousedown";
        await wrapper.find(".resize-handle").trigger(startEvent, { clientX: 10, clientY: 20 });
        expect(docAddListenerSpy).toHaveBeenCalledTimes(4);
        expect(docAddListenerSpy.mock.calls[0][0]).toBe("mousemove");
        expect(docAddListenerSpy.mock.calls[1][0]).toBe("touchmove");
        expect(docAddListenerSpy.mock.calls[2][0]).toBe("mouseup");
        expect(docAddListenerSpy.mock.calls[3][0]).toBe("touchend");
        expect(docRemoveListenerSpy).toHaveBeenCalledTimes(0);

        // Move event
        const moveHandlerIndex = touch ? 1 : 0; // touchmove or mousemove
        const moveHandler = docAddListenerSpy.mock.calls[moveHandlerIndex][1] as any;
        const moveEvent = {
            clientX: resizeTo.x,
            clientY: resizeTo.y,
            preventDefault: jest.fn()
        };
        moveHandler(moveEvent);
        expect((wrapper.vm as any).resizedSize).toStrictEqual(expectedEndSize);
        expect(moveEvent.preventDefault).toHaveBeenCalledTimes(1);

        // End resize
        const endHandlerIndex = touch ? 3 : 2; // touchend or mouseup
        const endHandler = docAddListenerSpy.mock.calls[endHandlerIndex][1] as any;
        const endEvent = { preventDefault: jest.fn() };
        endHandler(endEvent);
        expect(docRemoveListenerSpy).toHaveBeenCalledTimes(4);
        expect(docRemoveListenerSpy.mock.calls[0][0]).toBe("mousemove");
        expect(docRemoveListenerSpy.mock.calls[1][0]).toBe("touchmove");
        expect(docRemoveListenerSpy.mock.calls[2][0]).toBe("mouseup");
        expect(docRemoveListenerSpy.mock.calls[3][0]).toBe("touchend");
        expect(endEvent.preventDefault).toHaveBeenCalledTimes(1);

        await nextTick();

        const dialogElement = wrapper.find(".draggable-dialog").element as HTMLElement;
        expect(dialogElement.style.width).toBe(`${expectedEndSize.width}px`);
        expect(dialogElement.style.height).toBe(`${expectedEndSize.height}px`);
    };

    it("handles mouse resize", async () => {
        await testHandlesResize();
    });

    it("handles touch resize", async () => {
        await testHandlesResize(true);
    });

    it("constrains resize to minimum", async () => {
        await testHandlesResize(false, { x: 10, y: 20 }, { width: 140, height: 140 });
    });
});
