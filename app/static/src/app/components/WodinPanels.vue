<template>
    <div :class="modeClass">
        <div class="wodin-left" :class="leftAnimateClass">
            <span class="wodin-collapse-controls">
                <span v-if="canCollapseLeft" @click="collapseLeft()" class="collapse-control" id="collapse-left">
                    <vue-feather type="chevron-left"></vue-feather>
                </span>
                <span v-if="canCollapseRight" @click="collapseRight()" class="collapse-control" id="collapse-right">
                    <vue-feather type="chevron-right"></vue-feather>
                </span>
            </span>
            <div class="view-left" @click="collapseRight()">
                View Options
            </div>
            <div class="wodin-content" id="wodin-content-left">
                <slot name="left"></slot>
            </div>
        </div>
        <div class="wodin-right" :class="rightAnimateClass">
            <div class="view-right" @click="collapseLeft()">
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
        const leftAnimateClass = ref("");
        const rightAnimateClass = ref("");

        const modeClassMap: Record<PanelsMode, string> = {
            [PanelsMode.Both]: "wodin-mode-both",
            [PanelsMode.Left]: "wodin-mode-left",
            [PanelsMode.Right]: "wodin-mode-right"
        };

        const modeClass = computed(() => modeClassMap[mode.value]);

        const canCollapseLeft = computed(() => mode.value !== PanelsMode.Right);
        const canCollapseRight = computed(() => mode.value !== PanelsMode.Left);

        const collapse = (expandedMode: PanelsMode, collapsedMode: PanelsMode) => {
            if (mode.value === expandedMode) {
                mode.value = PanelsMode.Both;
            } else if (mode.value === PanelsMode.Both) {
                mode.value = collapsedMode;
            }
        };

        const getAnimateClass = (left: boolean, leftward: boolean) => {
            const panel = left ? "l" : "r";
            const movement = (left && leftward) || (!left && !leftward) ? "collapse" : "expand";
            const amount = mode.value === PanelsMode.Both ? "partial" : "full";
            return `slide-${panel}-panel-${movement}-${amount}`;
        };

        const collapseLeft = () => {
            collapse(PanelsMode.Left, PanelsMode.Right);
            leftAnimateClass.value = getAnimateClass(true, true);
            rightAnimateClass.value = getAnimateClass(false, true);
        };

        const collapseRight = () => {
            collapse(PanelsMode.Right, PanelsMode.Left);
            leftAnimateClass.value = getAnimateClass(true, false);
            rightAnimateClass.value = getAnimateClass(false, false);
        };

        return {
            mode,
            modeClass,
            canCollapseLeft,
            canCollapseRight,
            collapseLeft,
            collapseRight,
            leftAnimateClass,
            rightAnimateClass
        };
    }
});
</script>

<style scoped lang="scss">
    $handleWidth: 3rem;
    $fullWidth: calc(100% - 4rem);
    $fullHeight: calc(100vh - 5rem);

    $leftBothModeWidth: 30%;
    $rightBothModeWidth: 70%;

    $animationDuration: 0.5s;

    $dark-grey: #777;

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
        .wodin-left {
            width: $fullWidth;
        }

        .wodin-right {
            width: $handleWidth;

            .wodin-content {
                display: none;
            }
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
            width: $rightBothModeWidth;
        }

        .view-left, .view-right {
            display: none;
        }
    }

    .wodin-mode-right {
        .wodin-left {
            width: $handleWidth;

            .wodin-content {
                display: none;
            }
        }

        .wodin-right {
            width: $fullWidth;
        }

        .view-right {
            display: none;
        }
    }

    @keyframes show-content-after-anim {
        0% { opacity: 0; }
        99% { opacity: 0; }
        100% { opacity: 1; }
    }

    @keyframes l-panel-collapse-full {
        from { width: $leftBothModeWidth }
        to { width: $handleWidth }
    }
    .slide-l-panel-collapse-full {
        animation: l-panel-collapse-full;
        animation-duration: $animationDuration;

        .view-left {
            animation: show-content-after-anim;
            animation-duration: $animationDuration;
        }
    }

    @keyframes l-panel-collapse-partial {
        from { width: $fullWidth }
        to { width: $leftBothModeWidth }
    }
    .slide-l-panel-collapse-partial {
        animation: l-panel-collapse-partial;
        animation-duration: $animationDuration;
    }

    @keyframes l-panel-expand-full {
        from { width: $leftBothModeWidth }
        to { width: $fullWidth }
    }
    .slide-l-panel-expand-full {
        animation: l-panel-expand-full;
        animation-duration: $animationDuration;
    }

    @keyframes l-panel-expand-partial {
        from { width: $handleWidth }
        to { width: $leftBothModeWidth }
    }
    .slide-l-panel-expand-partial {
        animation: l-panel-expand-partial;
        animation-duration: $animationDuration;

        .wodin-content {
            animation: show-content-after-anim;
            animation-duration: $animationDuration;
        }
    }

    @keyframes r-panel-collapse-full {
        from { width: $rightBothModeWidth }
        to { width: $handleWidth }
    }
    .slide-r-panel-collapse-full {
        animation: r-panel-collapse-full;
        animation-duration: $animationDuration;

        .view-right {
            animation: show-content-after-anim;
            animation-duration: $animationDuration;
        }
    }

    @keyframes r-panel-collapse-partial {
        from { width: $fullWidth }
        to { width: $rightBothModeWidth }
    }
    .slide-r-panel-collapse-partial {
        animation: r-panel-collapse-partial;
        animation-duration: $animationDuration;
    }

    @keyframes r-panel-expand-full {
        from { width: $rightBothModeWidth }
        to { width: $fullWidth }
    }
    .slide-r-panel-expand-full {
        animation: r-panel-expand-full;
        animation-duration: $animationDuration;
    }

    @keyframes r-panel-expand-partial {
        from { width: $handleWidth }
        to { width: $rightBothModeWidth }
    }
    .slide-r-panel-expand-partial {
        animation: r-panel-expand-partial;
        animation-duration: $animationDuration;

        .wodin-content {
            animation: show-content-after-anim;
            animation-duration: $animationDuration;
        }
    }

    .wodin-collapse-controls {
        float: right;
        margin-top: 0.5rem;
        margin-right: 1rem;
        overflow: hidden;
        white-space: nowrap;

        .collapse-control {
            cursor: pointer;
            color: $dark-grey;
        }
    }
</style>
