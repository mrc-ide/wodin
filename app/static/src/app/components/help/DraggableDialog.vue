<template>
  <div ref="draggable" class="draggable-dialog p-2" :style="dialogStyle">
    <div ref="dragtarget">
      <h2 class="move prevent-select">
         <vue-feather type="move" class="grey"></vue-feather>
          {{title}}
        <vue-feather type="x" class="clickable grey float-end" @click="close"></vue-feather>
      </h2>
    </div>
    <div class="overflow-auto draggable-content">
      <slot></slot>
    </div>
    <div>
      <button class="btn btn-primary m-2 float-end" @click="close">Close</button>
    </div>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, ref
} from "vue";
import VueFeather from "vue-feather";

export default defineComponent({
    name: "DraggableDialog",
    props: {
      title: String
    },
    components: {
      VueFeather
    },
    setup(props, { emit }) {
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

        onMounted(() => {
            addDraggableListeners();
            if (draggable.value) {
                const rect = draggableRect();
                startingLeft.value = rect.left;
                startingTop.value = rect.top;
            }
            // close on resize - we'll reset initial size when re-mount
            window.addEventListener("resize", close);
        });

        const close = () => { emit("close"); };

        const dialogStyle = computed(() => {
            if (shiftLeft.value === 0 && shiftTop.value === 0) {
                return {};
            }

            // Don't allow top of draggable to move outside the bounds of the window
            const rect = draggableRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const maximizedTop = Math.max(startingTop.value + shiftTop.value, 0);
            const minimizedTop = Math.min(maximizedTop, viewportHeight - rect.height);
            const maximizedLeft = Math.max(startingLeft.value + shiftLeft.value, 0);
            const minimizedLeft = Math.min(maximizedLeft, viewportWidth - rect.width);
            return {top: `${minimizedTop}px`, left: `${minimizedLeft}px`};
        });

        return {
            draggable,
            dragtarget,
            dialogStyle,
            close
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
      height: calc(100% - 6rem);
    }
  }
</style>
