<template>
    <div :class="modeClass">
        <div class="wodin-left">
           left
        </div><div class="wodin-right">
            right
        </div>
    </div>
</template>

<script lang="ts">
    import { computed, defineComponent, ref } from "vue";

    export enum PanelsMode {
        Left, Right, Both
    }

    export default defineComponent({
        name: "ErrorsAlert",
        setup() {
            //TODO: add slots

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

            return {
                modeClass
            }
        }
    });
</script>

<style scoped lang="scss">

    /*for testing*/
    .wodin-left {
        height: 200px;
        background-color: #ffecb5;
    }

    .wodin-right {
        height: 200px;
        background-color: #d3d3d4;
    }

    $handleWidth: 2rem;
    $fullWidth: calc(100% - 2rem);
    .wodin-mode-left {
        .wodin-left {
            width: $fullWidth;
        }

        .wodin-right {
            width: $handleWidth;
        }
    }

    .wodin-mode-both {
        .wodin-left {
            width: 30%
        }

        .wodin-right {
            width: 70%;
        }
    }

    .wodin-mode-right {
        .wodin-left {
            width: $handleWidth;
        }

        .wodin-right {
            width: $fullWidth;
        }
    }

</style>
