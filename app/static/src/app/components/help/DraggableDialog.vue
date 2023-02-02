<template>
  <div ref="draggable" class="draggable-dialog" :style="dialogStyle">
    <div ref="dragtarget">
      <h1>Title</h1>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, ref
} from "vue";

export default defineComponent({
    name: "DraggableDialog",
    setup() {
        // TODO: Max height and scrollable

        const draggable = ref<null | HTMLElement>(null); // Picks up the element with 'draggable' ref in the template
        const dragtarget = ref<null | HTMLElement>(null);
        const startingLeft = ref(0);
        const startingTop = ref(0);
        const shiftLeft = ref(0);
        const shiftTop = ref(0);

        const getTouchEvent = (event: any) => {
            return event.touches && event.touches.length > 0 ? event.touches[0] : event;
        };

        const addDraggableListeners = () => {
            const dragger = dragtarget.value;
            if (dragger) {
                let startX = 0;
                let startY = 0;
                let initialShiftLeft = 0;
                let initialShiftTop = 0;

                const handleDraggableMousemove = (event: any) => {
                    const { clientX, clientY } = getTouchEvent(event);
                    shiftLeft.value = initialShiftLeft + clientX - startX;
                    shiftTop.value = initialShiftTop + clientY - startY;
                    event.preventDefault();
                };

                const handleDraggableMouseup = (event: any) => {
                    document.removeEventListener("mousemove", handleDraggableMousemove);
                    document.removeEventListener("touchmove", handleDraggableMousemove);
                    document.removeEventListener("mouseup", handleDraggableMouseup);
                    document.removeEventListener("touchend", handleDraggableMouseup);
                    event.preventDefault();
                };
                const handleDraggableMousedown = (event: any) => {
                    const { target } = event;
                    if (target?.nodeName === "BUTTON") {
                        return;
                    }
                    const { clientX, clientY } = getTouchEvent(event);
                    document.addEventListener("mousemove", handleDraggableMousemove);
                    document.addEventListener("touchmove", handleDraggableMousemove);
                    document.addEventListener("mouseup", handleDraggableMouseup);
                    document.addEventListener("touchend", handleDraggableMouseup);
                    startX = clientX;
                    startY = clientY;
                    initialShiftLeft = shiftLeft.value;
                    initialShiftTop = shiftTop.value;
                };

                dragger.addEventListener("mousedown", handleDraggableMousedown);
                dragger.addEventListener("touchstart", handleDraggableMousedown);
            }
        };

        const draggableRect = () => (draggable.value ? draggable.value.getBoundingClientRect() : {left: 0, top: 0, width: 0, height: 0});

        // TODO: reset shiftLeft + shiftTop on hide - or not?
        onMounted(() => {
            addDraggableListeners();
            if (draggable.value) {
                const rect = draggableRect();
                startingLeft.value = rect.left;
                startingTop.value = rect.top;
            }
        });

        const dialogStyle = computed(() => {
            if (shiftLeft.value === 0 && shiftTop.value === 0) {
                return {};
            }

            // Don't allow top of draggable to move above the top of window - as will lose ability to drag from title
            // Don't allow draggable to be dragged more than 50% of screen in either dimension
            const rect = draggableRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const maximizedTop = Math.max(startingTop.value + shiftTop.value, 0);
            const minimizedTop = Math.min(maximizedTop, viewportHeight - (rect.height / 2));
            const maximizedLeft = Math.max(startingLeft.value + shiftLeft.value, -(rect.width / 2));
            const minimizedLeft = Math.min(maximizedLeft, viewportWidth - (rect.width / 2));
            return {top: `${minimizedTop}px`, left: `${minimizedLeft}px`};
        });

        return {
            draggable,
            dragtarget,
            dialogStyle
        };
    }
});
</script>

<style lang="scss" scoped>
  .draggable-dialog {
    background-color: white;
    position: absolute;
    width: 80%;  // TODO: replace with size props
    max-height: 80%;
    z-index: 9999;
    box-shadow: 10px 10px 15px 0px rgba(117,117,117,0.5);
    top: 10%;
    left: 10%;
  }
</style>
