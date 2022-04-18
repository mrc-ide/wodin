<template>
    <div :class="modeClass">
        <div class="wodin-left">
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
        <div class="wodin-right">
            <div class="view-right" @click="collapseLeft()">
                View Charts
            </div>
            <div class="wodin-content" id="wodin-content-right">
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

            const modeClass = computed(() => {
                switch(mode.value) {
                    case PanelsMode.Left:
                        return "wodin-mode-left";
                    case PanelsMode.Both:
                        return "wodin-mode-both";
                    case PanelsMode.Right:
                        return "wodin-mode-right";
                }
            });

            const canCollapseLeft = computed(() => mode.value !== PanelsMode.Right);
            const canCollapseRight = computed(() => mode.value !== PanelsMode.Left);

            const collapseLeft = () => {
                if (mode.value === PanelsMode.Left) {
                    mode.value = PanelsMode.Both;
                } else if (mode.value == PanelsMode.Both) {
                    mode.value = PanelsMode.Right;
                }
            };

            const collapseRight = () => {
                if (mode.value === PanelsMode.Right) {
                    mode.value = PanelsMode.Both;
                } else if (mode.value == PanelsMode.Both) {
                    mode.value = PanelsMode.Left;
                }
            };

            return {
                modeClass,
                canCollapseLeft,
                canCollapseRight,
                collapseLeft,
                collapseRight
            }
        }
    });
</script>

<style scoped lang="scss">
    $handleWidth: 3rem;
    $fullWidth: calc(100% - 4rem);
    $fullHeight: calc(100vh - 5rem);

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
            width: 30%
        }

        .wodin-right {
            width: 70%;
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

    .wodin-collapse-controls {
        float: right;
        margin-top: 0.5rem;
        margin-right: 1rem;

        .collapse-control {
            cursor: pointer;
            color: $dark-grey;
        }
    }
</style>
