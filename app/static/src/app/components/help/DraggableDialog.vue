<template>
  <div ref="draggable" class="draggable-dialog" :style="dialogStyle">
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
        // TODO: Make text non-selectable
        // TODO: replace initial margin auto with calculated position on show

        const draggable = ref<null | HTMLElement>(null); // Picks up the element with 'draggable' ref in the template
        const startingLeft = ref(0);
        const startingTop = ref(0);
        const shiftLeft = ref(0);
        const shiftTop = ref(0);

        const getTouchEvent = (event: any) => {
            return event.touches && event.touches.length > 0 ? event.touches[0] : event;
        };

        const addDraggableListeners = () => {
            const dragger = draggable.value;
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

        // TODO: reset shiftLeft + shiftTop on hide
        onMounted(() => {
            addDraggableListeners();
            if (draggable.value) {
                const rect = draggable.value.getBoundingClientRect();
                startingLeft.value = rect.left;
                startingTop.value = rect.top;
            }
        });

        const dialogStyle = computed(() => {
            if (shiftLeft.value === 0 && shiftTop.value === 0) {
                return { margin: "auto" };
            }
            const top = startingTop.value + shiftTop.value;
            const left = startingLeft.value + shiftLeft.value;
            return {top: `${top}px`, left: `${left}px`};
        });

        return {
            draggable,
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
  }
</style>
