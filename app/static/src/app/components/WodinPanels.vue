<template>
    <div :class="dragStart !== null ? 'show-drag-cursor' : ''" ref="panelsWindow">
        <div :class="modeClass">
            <div class="wodin-left" :style="optionsWidth">
                <span class="wodin-collapse-controls">
                    <span @mousedown="handleDragStartIcon" @mouseup="handleDragEnd" id="resize-panel-control">
                        <vue-feather type="maximize-2"
                                    style="transform: rotate(45deg); color: grey;"></vue-feather>
                    </span>
                </span>
                <div v-show="hidePanelMode === HidePanelContent.Left"
                    @click="openCollapsedView"
                    class="view-left">
                    View Options
                </div>
                <div v-show="hidePanelMode !== HidePanelContent.Left"
                    class="wodin-content"
                    id="wodin-content-left">
                    <slot name="left"></slot>
                </div>
            </div>
            <div class="wodin-right" :style="chartsWidth">
                <div class="edge-resize"
                    @mousedown="handleDragStartEdge"
                    @mouseup="handleDragEnd"></div>
                <div v-show="hidePanelMode === HidePanelContent.Right"
                    @click="openCollapsedView"
                    class="view-right">
                    View Charts
                </div>
                <div v-show="hidePanelMode !== HidePanelContent.Right"
                    class="wodin-content p-2"
                    id="wodin-content-right">
                    <slot name="right"></slot>
                </div>
            </div>
        </div>
    </div>
    <div style="clear:both;"></div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, onUnmounted, ref
} from "vue";
import VueFeather from "vue-feather";

export enum PanelsMode {
    Left, Right, Both
}

export enum HidePanelContent {
    Left, Right, None
}

enum DragStart {
    Icon, Edge
}

type WidthStyle = {
    width?: string
}

export default defineComponent({
    name: "WodinPanels",
    components: {
        VueFeather
    },
    setup() {
        const windowWidth = ref(window.innerWidth);
        const panelsWindow = ref<null | HTMLElement>(null);
        /*
            Window boundary variables are the points on either side at which the the
            panel doesn't display content anymore and if they mouseup at that region
            the panel will snap and collapse to that side. They also enforce that the
            options panel is at least 200px wide and the charts at least 400px

            Snap tolerance variables are points on either side at which the panel snaps
            even if they haven't emitted a mouseup event (let go of the drag). In general,
            we divide by a factor of 3 to get the snap tolerance from the boundary
        */
        const windowBoundaryLeft = computed(() => Math.max(windowWidth.value / 8, 200));
        const windowMinRightPanelWidth = computed(() => Math.max(windowWidth.value / 4, 400));
        const windowBoundaryRight = computed(() => windowWidth.value - windowMinRightPanelWidth.value);
        const snapToleranceLeft = computed(() => windowBoundaryLeft.value / 3);
        const snapToleranceRight = computed(() => windowWidth.value - windowMinRightPanelWidth.value / 3);

        const optionsWidth = ref<WidthStyle>({});
        const chartsWidth = ref<WidthStyle>({});

        const mode = ref<PanelsMode>(PanelsMode.Both);
        const modeClassMap: Record<PanelsMode, string> = {
            [PanelsMode.Both]: "wodin-mode-both",
            [PanelsMode.Left]: "wodin-mode-left",
            [PanelsMode.Right]: "wodin-mode-right"
        };
        const modeClass = computed(() => modeClassMap[mode.value]);
        const dragStart = ref<DragStart | null>(null);
        const hidePanelMode = ref<HidePanelContent>(HidePanelContent.None);

        const resize = () => {
            // complete reset to avoid the panel being across
            // boundary off the browser window
            windowWidth.value = window.innerWidth;
            hidePanelMode.value = HidePanelContent.None;
            mode.value = PanelsMode.Both;
            const optionsWidthVal = `max(${windowBoundaryLeft.value}px, 30%)`;
            optionsWidth.value.width = `max(${windowBoundaryLeft.value}px, 30%) !important`;
            chartsWidth.value.width = `calc(100% - ${optionsWidthVal}) !important`;
        };

        const resizeObserver = new ResizeObserver(resize);
        onMounted(() => {
            if (panelsWindow.value) {
                resizeObserver.observe(panelsWindow.value);
            }
        });
        onUnmounted(() => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });

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
            event.preventDefault();
            const { clientX } = getTouchEvent(event) as MouseEvent | Touch;

            if (clientX > snapToleranceRight.value) {
                optionsWidth.value.width = "";
                chartsWidth.value.width = "";
                mode.value = PanelsMode.Left;
            } else if (clientX < snapToleranceLeft.value) {
                optionsWidth.value.width = "";
                chartsWidth.value.width = "";
                mode.value = PanelsMode.Right;
            } else if (clientX > windowBoundaryRight.value) {
                const optionsWidthVal = `calc(${clientX}px + ${dragStart.value === DragStart.Icon ? 1.4 : -1}rem)`;
                optionsWidth.value.width = `${optionsWidthVal} !important`;
                chartsWidth.value.width = `calc(100% - ${optionsWidthVal}) !important`;
                mode.value = PanelsMode.Both;
                hidePanelMode.value = HidePanelContent.Right;
            } else if (clientX < windowBoundaryLeft.value) {
                const optionsWidthVal = `calc(${clientX}px + ${dragStart.value === DragStart.Icon ? 1.4 : -1}rem)`;
                optionsWidth.value.width = `${optionsWidthVal} !important`;
                chartsWidth.value.width = `calc(100% - ${optionsWidthVal}) !important`;
                mode.value = PanelsMode.Both;
                hidePanelMode.value = HidePanelContent.Left;
            } else {
                const optionsWidthVal = `calc(${clientX}px + ${dragStart.value === DragStart.Icon ? 1.4 : -1}rem)`;
                optionsWidth.value.width = `${optionsWidthVal} !important`;
                chartsWidth.value.width = `calc(100% - ${optionsWidthVal}) !important`;
                mode.value = PanelsMode.Both;
                hidePanelMode.value = HidePanelContent.None;
            }
        };

        const handleDragEnd = (event: Event) => {
            dragStart.value = null;

            const { clientX } = getTouchEvent(event) as MouseEvent | Touch;

            if (clientX > windowBoundaryRight.value) {
                optionsWidth.value.width = "";
                chartsWidth.value.width = "";
                mode.value = PanelsMode.Left;
            } else if (clientX < windowBoundaryLeft.value) {
                optionsWidth.value.width = "";
                chartsWidth.value.width = "";
                mode.value = PanelsMode.Right;
            } else {
                mode.value = PanelsMode.Both;
            }

            removeDragListeners(handleDragMove, handleDragEnd);
        };

        const handleDragStart = (event: Event) => {
            event.preventDefault();
            addDragListeners(handleDragMove, handleDragEnd);
        };

        const handleDragStartEdge = (event: Event) => {
            dragStart.value = DragStart.Edge;
            handleDragStart(event);
        };

        const handleDragStartIcon = (event: Event) => {
            dragStart.value = DragStart.Icon;
            handleDragStart(event);
        };

        const openCollapsedView = () => {
            optionsWidth.value.width = "30%";
            chartsWidth.value.width = "70%";
            mode.value = PanelsMode.Both;
            hidePanelMode.value = HidePanelContent.None;
        };

        return {
            mode,
            modeClass,
            chartsWidth,
            optionsWidth,
            handleDragStart,
            handleDragEnd,
            openCollapsedView,
            handleDragMove,
            hidePanelMode,
            HidePanelContent,
            PanelsMode,
            handleDragStartEdge,
            handleDragStartIcon,
            dragStart,
            panelsWindow,
            resize,
            windowWidth
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

    .show-drag-cursor {
        cursor: col-resize !important;
    }

    .edge-resize {
        left: 0;
        position: absolute;
        height: 100%;
        width: 10px;
    }
    .edge-resize:hover {
        cursor: col-resize;
    }

    .wodin-left, .wodin-right {
        float: left;
        height: $fullHeight;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
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
        transform: rotate(90deg);
    }

    .view-left {
        position: absolute;
        right: -2.7rem;
        top: 7rem
    }

    .view-right {
        position: absolute;
        translate: -4rem 7rem;
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
    }

    .wodin-mode-both {
        .wodin-left {
            width: $leftBothModeWidth;
        }

        .wodin-right {
            width: $rightBothModeWidth
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
