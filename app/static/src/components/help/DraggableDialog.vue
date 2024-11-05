<template>
    <div ref="draggable" class="draggable-dialog p-2" :style="dialogStyle">
        <div class="dragtarget clearfix" @mousedown="handleDragStart" @touchstart="handleDragStart">
            <h3 class="move prevent-select">
                <vue-feather type="move" class="grey"></vue-feather>
                <vue-feather type="x" class="clickable grey float-end" @click="close"></vue-feather>
                <div class="dialog-title">{{ title }}</div>
            </h3>
        </div>
        <div class="overflow-auto draggable-content">
            <slot></slot>
        </div>
        <svg
            class="resize-handle"
            height="24"
            width="24"
            @mousedown="handleResizeStart"
            @touchstart="handleResizeStart"
        >
            <polygon points="0,24 24,0 24,24" style="fill: white" />
            <line x1="0" y1="24" x2="24" y2="0" style="stroke: #aaa; stroke-width: 2" />
            <line x1="6" y1="24" x2="24" y2="6" style="stroke: #aaa; stroke-width: 2" />
            <line x1="12" y1="24" x2="24" y2="12" style="stroke: #aaa; stroke-width: 2" />
            <line x1="18" y1="24" x2="24" y2="18" style="stroke: #aaa; stroke-width: 2" />
        </svg>
    </div>
</template>

<script lang="ts">
import { computed, CSSProperties, defineComponent, onMounted, ref } from "vue";
import VueFeather from "vue-feather";

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export default defineComponent({
    name: "DraggableDialog",
    props: {
        title: String
    },
    components: {
        VueFeather
    },
    setup(props, { emit }) {
        const draggable = ref<null | HTMLElement>(null); // Picks up the element with 'draggable' ref in the template
        const zeroPoint = { x: 0, y: 0 };
        const minimumSize = 140; // Minimum width and height in px

        const position = ref<Point | null>(null);
        const moveClientStart = ref<Point | null>(null);
        const movePositionStart = ref<Point | null>(null);
        const resizedSize = ref<Size | null>(null);
        const resizeClientStart = ref<Point | null>(null);
        const resizeStartSize = ref<Size | null>(null);

        const getTouchEvent = (event: Event) => {
            return (event as TouchEvent).touches?.length > 0 ? (event as TouchEvent).touches[0] : event;
        };

        const draggableRect = () =>
            draggable.value ? draggable.value.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };

        const getViewportSize = () => ({ width: window.innerWidth, height: window.innerHeight });

        const containInWindow = (newPosition: Point) => {
            // Don't allow top of draggable to move outside the bounds of the window
            const rect = draggableRect();
            const viewportSize = getViewportSize();

            const containedX = Math.min(Math.max(newPosition.x, 0), viewportSize.width - rect.width);
            const containedY = Math.min(Math.max(newPosition.y, 0), viewportSize.height - rect.height);

            return { x: containedX, y: containedY };
        };

        const constrainSize = (newSize: Size) => {
            const rect = draggableRect();
            const viewportSize = getViewportSize();
            // Don't allow size smaller than min, or which will expand off the screen
            const constrainedWidth = Math.min(Math.max(newSize.width, minimumSize), viewportSize.width - rect.left);
            const constrainedHeight = Math.min(Math.max(newSize.height, minimumSize), viewportSize.height - rect.top);
            return {
                width: constrainedWidth,
                height: constrainedHeight
            };
        };

        type DragHandler = (event: Event) => void;

        const addDragListeners = (move: DragHandler, end: DragHandler) => {
            document.addEventListener("mousemove", move);
            document.addEventListener("touchmove", move);
            document.addEventListener("mouseup", end);
            document.addEventListener("touchend", end);
        };

        const removeDragListeners = (move: DragHandler, end: DragHandler) => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("touchmove", move);
            document.removeEventListener("mouseup", end);
            document.removeEventListener("touchend", end);
        };

        const handleDragMove = (event: Event) => {
            if (movePositionStart.value && moveClientStart.value) {
                const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
                position.value = containInWindow({
                    x: movePositionStart.value.x + clientX - moveClientStart.value.x,
                    y: movePositionStart.value.y + clientY - moveClientStart.value.y
                });
            }
            event.preventDefault();
        };

        const handleDragEnd = (event: Event) => {
            removeDragListeners(handleDragMove, handleDragEnd);
            movePositionStart.value = null;
            moveClientStart.value = null;
            event.preventDefault();
        };
        const handleDragStart = (event: Event) => {
            const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
            moveClientStart.value = { x: clientX, y: clientY };
            movePositionStart.value = position.value ? { x: position.value.x, y: position.value.y } : { ...zeroPoint };
            addDragListeners(handleDragMove, handleDragEnd);
        };

        const handleResizeMove = (event: Event) => {
            if (resizeStartSize.value && resizeClientStart.value) {
                const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
                const width = resizeStartSize.value.width + clientX - resizeClientStart.value.x;
                const height = resizeStartSize.value.height + clientY - resizeClientStart.value.y;

                resizedSize.value = constrainSize({ width, height });
            }
            event.preventDefault();
        };

        const handleResizeEnd = (event: Event) => {
            removeDragListeners(handleResizeMove, handleResizeEnd);
            resizeClientStart.value = null;
            resizeStartSize.value = null;
            event.preventDefault();
        };

        const handleResizeStart = (event: Event) => {
            const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
            resizeClientStart.value = { x: clientX, y: clientY };
            const rect = draggableRect();
            resizeStartSize.value = { width: rect.width, height: rect.height };
            addDragListeners(handleResizeMove, handleResizeEnd);
        };

        const close = () => {
            emit("close");
        };

        onMounted(() => {
            if (draggable.value) {
                const rect = draggableRect();
                position.value = { x: rect.left, y: rect.top };
            }
            // close on resize - we'll reset initial size when re-mount
            window.addEventListener("resize", close);
        });

        const dialogStyle = computed(() => {
            const result = {} as Partial<CSSProperties>;
            if (position.value) {
                result.top = `${position.value.y}px`;
                result.left = `${position.value.x}px`;
            }
            if (resizedSize.value) {
                result.width = `${resizedSize.value.width}px`;
                result.height = `${resizedSize.value.height}px`;
            }

            return result;
        });

        return {
            draggable,
            moveClientStart,
            movePositionStart,
            position,
            resizedSize,
            dialogStyle,
            close,
            handleDragStart,
            handleResizeStart
        };
    }
});
</script>

<style lang="scss" scoped>
.move {
    cursor: move;
}

.draggable-dialog {
    background-color: white;
    position: absolute;
    width: 60%;
    height: 80%;
    z-index: 9999;
    box-shadow: 0 0 15px 0 rgba(117, 117, 117, 0.5);
    top: 10%;
    left: 20%;

    .dragtarget {
        white-space: nowrap;

        .dialog-title {
            display: inline-block;
            overflow: hidden;
            width: calc(100% - 48px);
            vertical-align: bottom;
        }
    }

    .draggable-content {
        background-color: aliceblue;
        border: #ccc 1px solid;
        height: calc(100% - 42px);
    }

    .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 24px;
        height: 24px;
        cursor: nw-resize;
    }
}
</style>
