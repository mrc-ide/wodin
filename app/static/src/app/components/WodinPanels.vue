<template>
    <div :class="isDragging ? 'drag-overlay' : 'drag-overlay-hidden'">
        <div class="divider-line-left"></div>
        <div class="divider-line-right"></div>
    </div>
    <div :class="modeClass">
        <div class="wodin-left" :style="panelWidth">
            <span class="wodin-collapse-controls">
                <span @mousedown="handleDragStart" @mouseup="handleDragEnd" id="resize-panel-control">
                    <vue-feather type="maximize-2"
                                 style="transform: rotate(45deg); color: grey;"></vue-feather>
                </span>
            </span>
            <div class="view-left" @click="openCollapsedView">
                View Options
            </div>
            <div class="wodin-content" id="wodin-content-left">
                <slot name="left"></slot>
            </div>
        </div>
        <div class="wodin-right" :style="plotWidth">
            <div class="view-right" @click="openCollapsedView">
                View Charts
            </div>
            <div class="wodin-content p-2" id="wodin-content-right">
                <slot name="right"></slot>
            </div>
        </div>
    </div>
    <div style="clear:both;"></div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import VueFeather from "vue-feather";

export enum PanelsMode {
    Left, Right, Both
}

export default defineComponent({
    name: "WodinPanels",
    components: {
        VueFeather
    },
    setup() {
        const mode = ref<PanelsMode>(PanelsMode.Both);
        const modeClassMap: Record<PanelsMode, string> = {
            [PanelsMode.Both]: "wodin-mode-both",
            [PanelsMode.Left]: "wodin-mode-left",
            [PanelsMode.Right]: "wodin-mode-right"
        };

        const modeClass = computed(() => modeClassMap[mode.value]);

        const panelWidth = ref<any>({});
        const plotWidth = ref<any>({});
        const isDragging = ref<boolean>(false);

        const getTouchEvent = (event: Event) => {
            return (event as TouchEvent).touches?.length > 0 ? (event as TouchEvent).touches[0] : event;
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
            const { clientX } = getTouchEvent(event) as MouseEvent | Touch;
            const windowWidth = window.innerWidth;
            // different snap tolerance because the plot does not look
            // good with width of windowWidth / 8
            const widthToleranceLeft = windowWidth / 8;
            const widthToleranceRight = windowWidth / 4;
            const windowBoundaryLeft = widthToleranceLeft;
            const windowBoundaryRight = windowWidth - widthToleranceRight;

            if (clientX > windowBoundaryRight) {
                mode.value = PanelsMode.Left;
            } else if (clientX < windowBoundaryLeft) {
                mode.value = PanelsMode.Right;
            } else {
                mode.value = PanelsMode.Both;
            }

            panelWidth.value.width = `calc(${clientX}px + 1.4rem)`;
            plotWidth.value.width = `calc(100vw - ${clientX}px - 5rem)`;
            event.preventDefault();
        };

        const handleDragEnd = () => {
            isDragging.value = false;
            removeDragListeners(handleDragMove, handleDragEnd);
        };
        const handleDragStart = () => {
            isDragging.value = true;
            addDragListeners(handleDragMove, handleDragEnd);
        };

        const openCollapsedView = () => {
            panelWidth.value.width = "30%";
            plotWidth.value.width = "70%";
            mode.value = PanelsMode.Both;
        };

        return {
            mode,
            modeClass,
            plotWidth,
            panelWidth,
            handleDragStart,
            handleDragEnd,
            openCollapsedView,
            handleDragMove,
            isDragging
        };
    }
});
</script>

<style scoped lang="scss">
    $fullHeight: calc(100vh - 5rem);

    $leftBothModeWidth: 30%;
    $rightBothModeWidth: 70%;

    $animationDuration: 0.5s;

    $dark-grey: #777;

    $widthToleranceLeft: calc(100% / 8);
    $widthToleranceRight: calc(100% - calc(100% / 4));

    .drag-overlay {
        position: fixed;
        background-color: rgba($color: #000000, $alpha: 0.25);
        z-index: 9999;
        width: 100vw;
        max-width: 100%;
        height: 100vh;
        left: 0;
        top: 0;
        margin-top: 3.5rem;
    }

    .drag-overlay-hidden {
        position: fixed;
        visibility: hidden;
    }

    .divider-line-left {
        position: fixed;
        border-left: 5px dashed #fff;
        height: 100%;
        left: $widthToleranceLeft
    }

    .divider-line-right {
        position: fixed;
        border-left: 5px dashed #fff;
        height: 100%;
        left: $widthToleranceRight
    }

    .wodin-left, .wodin-right {
        float: left;
        height: $fullHeight;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .wodin-left {
        border-right-style: solid;
        border-right-width: 1px;
        border-radius: 0 1rem 0 0;
        border-color: $dark-grey;
    }

    .view-left, .view-right {
        cursor: pointer;
        width: 10rem;
        color: $dark-grey;
    }

    .view-left {
        transform: rotate(90deg) translate(6rem, 2.7rem);
    }

    .view-right {
        transform: rotate(90deg) translate(6rem, 4rem);
    }

    .wodin-mode-left {
        .wodin-right {
            width: 3.5rem !important;
            .wodin-content {
                display: none;
            }
        }

        .wodin-left {
            width: calc(100% - 3.5rem) !important;
        }

        .view-left {
            display: none;
        }
    }

    .wodin-mode-both {
        .wodin-left {
            width: $leftBothModeWidth;
        }

        .wodin-right {
            width: $rightBothModeWidth
        }

        .view-left, .view-right {
            display: none;
        }
    }

    .wodin-mode-right {
        .wodin-left {
            width: 3.5rem !important;
            .wodin-content {
                display: none;
            }
        }

        .wodin-right {
            width: calc(100% - 3.5rem) !important;
        }

        .view-right {
            display: none;
        }
    }

    .wodin-collapse-controls {
        float: right;
        margin-top: 0.5rem;
        margin-right: 1.5rem;
        white-space: nowrap;

        :hover {
            cursor: col-resize;
        }
    }
</style>
