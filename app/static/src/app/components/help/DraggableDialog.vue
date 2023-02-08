<template>
  <div ref="draggable" class="draggable-dialog p-2" :style="dialogStyle">
    <div class="dragtarget clearfix" @mousedown="handleDragStart" @touchstart="handleDragStart">
      <h3 class="move prevent-select">
         <vue-feather type="move" class="grey"></vue-feather>
         <vue-feather type="x" class="clickable grey float-end" @click="close"></vue-feather>
         <div class="dialog-title">{{title}}</div>
      </h3>
    </div>
    <div class="overflow-auto draggable-content">
      <slot></slot>
    </div>
    <div class="resize-handle" @mousedown="handleResizeStart" @touchstart="handleResizeStart"></div>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, ref
} from "vue";
import VueFeather from "vue-feather";

interface Point {
  x: number,
  y: number
}

interface Size {
  width: number,
  height: number
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

        const position = ref<Point | null>(null);
        const moveClientStart = ref<Point | null>(null);
        const movePositionStart = ref<Point | null>(null);
        const resizedSize = ref<Size | null>(null);
        const resizeClientStart = ref<Point | null>(null);
        const resizeStartSize = ref<Size | null>(null);

        const getTouchEvent = (event: Event) => {
            return (event as TouchEvent).touches?.length > 0 ? (event as TouchEvent).touches[0] : event;
        };

        const draggableRect = () => (draggable.value ? draggable.value.getBoundingClientRect() : {
            left: 0, top: 0, width: 0, height: 0
        });

        const containInWindow = (newPosition: Point) => {
            // Don't allow top of draggable to move outside the bounds of the window
            const rect = draggableRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const containedX = Math.min(Math.max(newPosition.x, 0), viewportWidth - rect.width);
            const containedY = Math.min(Math.max(newPosition.y, 0), viewportHeight - rect.height);

            return { x: containedX, y: containedY };
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
            document.removeEventListener("mousemove", handleDragMove);
            document.removeEventListener("touchmove", handleDragMove);
            document.removeEventListener("mouseup", handleDragEnd);
            document.removeEventListener("touchend", handleDragEnd);
            movePositionStart.value = null;
            moveClientStart.value = null;
            event.preventDefault();
        };
        const handleDragStart = (event: Event) => {
            const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
            document.addEventListener("mousemove", handleDragMove);
            document.addEventListener("touchmove", handleDragMove);
            document.addEventListener("mouseup", handleDragEnd);
            document.addEventListener("touchend", handleDragEnd);

            moveClientStart.value = { x: clientX, y: clientY };
            movePositionStart.value = position.value ? { x: position.value.x, y: position.value.y } : { ...zeroPoint };
        };

        const handleResizeMove = (event: Event) => {
            if (resizeStartSize.value && resizeClientStart.value) {
                const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
                // resizeWidth.value = resizeStartWidth.value + clientX - resizeClientStart.value.x;
                // resizeHeight.value = resizeStartHeight.value + clientY - resizeClientStart.value.y;

                resizedSize.value = {
                    width: resizeStartSize.value.width + clientX - resizeClientStart.value.x,
                    height: resizeStartSize.value.height + clientY - resizeClientStart.value.y
                };
            }
            event.preventDefault();
        };

        const handleResizeEnd = (event: Event) => {
            document.removeEventListener("mousemove", handleResizeMove);
            document.removeEventListener("touchmove", handleResizeMove);
            document.removeEventListener("mouseup", handleResizeEnd);
            document.removeEventListener("touchend", handleResizeEnd);
            resizeClientStart.value = null;
            resizeStartSize.value = null;
            event.preventDefault();
        };

        const handleResizeStart = (event: Event) => {
            const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
            document.addEventListener("mousemove", handleResizeMove);
            document.addEventListener("touchmove", handleResizeMove);
            document.addEventListener("mouseup", handleResizeEnd);
            document.addEventListener("touchend", handleResizeEnd);
            resizeClientStart.value = { x: clientX, y: clientY };
            const rect = draggableRect();
            resizeStartSize.value = { width: rect.width, height: rect.height };
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
            const result = {} as any; // TODO: sort this out Partial style
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
    box-shadow: 0 0 15px 0 rgba(117,117,117,0.5);
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
      height: calc(100% - 2.5rem);
    }

    .resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 0;
      height: 0;
      cursor: nw-resize;
      border-top: 0;
      border-right: 0;
      border-left: 2rem solid transparent;
      border-bottom: 2rem solid grey;

    }
  }
</style>
