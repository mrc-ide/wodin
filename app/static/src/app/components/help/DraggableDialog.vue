<template>
  <div ref="draggable" class="draggable-dialog p-2" :style="dialogStyle">
    <div ref="dragtarget" @mousedown="handleDragStart" @touchstart="handleDragStart">
      <h3 class="move prevent-select">
         <vue-feather type="move" class="grey"></vue-feather>
          {{title}}
        <vue-feather type="x" class="clickable grey float-end" @click="close"></vue-feather>
      </h3>
    </div>
    <div class="overflow-auto draggable-content">
      <slot></slot>
    </div>
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
        const dragtarget = ref<null | HTMLElement>(null);

        const position = ref<Point>({ x: 0, y: 0 });
        const moveClientStart = ref<Point>({ x: 0, y: 0 });
        const movePositionStart = ref<Point>({ x: 0, y: 0 });

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
            const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
            position.value = containInWindow({
                x: movePositionStart.value.x + clientX - moveClientStart.value.x,
                y: movePositionStart.value.y + clientY - moveClientStart.value.y
            });
            event.preventDefault();
        };

        const handleDragEnd = (event: any) => {
            document.removeEventListener("mousemove", handleDragMove);
            document.removeEventListener("touchmove", handleDragMove);
            document.removeEventListener("mouseup", handleDragEnd);
            document.removeEventListener("touchend", handleDragEnd);
            event.preventDefault();
        };
        const handleDragStart = (event: any) => {
            const { clientX, clientY } = getTouchEvent(event) as MouseEvent | Touch;
            document.addEventListener("mousemove", handleDragMove);
            document.addEventListener("touchmove", handleDragMove);
            document.addEventListener("mouseup", handleDragEnd);
            document.addEventListener("touchend", handleDragEnd);

            moveClientStart.value = { x: clientX, y: clientY };
            movePositionStart.value = { x: position.value.x, y: position.value.y };
        };

        const close = () => { emit("close"); };

        onMounted(() => {
            if (draggable.value) {
                const rect = draggableRect();
                position.value = { x: rect.left, y: rect.top };
            }
            // close on resize - we'll reset initial size when re-mount
            window.addEventListener("resize", close);
        });

        const dialogStyle = computed(() => {
            if (position.value.x === 0 && position.value.y === 0) {
                return {};
            }

            return { top: `${position.value.y}px`, left: `${position.value.x}px` };
        });

        return {
            draggable,
            dragtarget,
            dialogStyle,
            close,
            handleDragStart
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

    .draggable-content {
      background-color: aliceblue;
      border: #ccc 1px solid;
      height: calc(100% - 2.5rem);
    }
  }
</style>
