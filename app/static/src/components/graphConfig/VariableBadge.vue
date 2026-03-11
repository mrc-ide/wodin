<template>
    <span class="badge variable me-2"
          :class="inHidden ? 'mb-2' : ''"
          :style="style"
          draggable="true"
          @dragstart="$event => $emit('dragstart', $event)"
          @dragend="$event => $emit('dragend', $event)">
        <span class="variable-name">{{ variable }}</span>
        <span v-if="!inHidden" class="variable-delete">
          <button @click="() => $emit('removeVariable', variable)"
                    v-tooltip="'Remove variable'">×</button>
        </span>
    </span>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { default as Color } from "color";
import { AppState } from "@/store/appState/state";

export default defineComponent({
    emits: ["dragstart", "dragend", "removeVariable"],
    props: {
        variable: {
            type: String,
            required: true,
        },
        inHidden: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const store = useStore<AppState>();
        const style = computed(() => {
            const { paletteModel } = store.state.model;
            const baseColor = paletteModel ? paletteModel[props.variable] : "#bbb";
            const fadedColor = Color(baseColor).desaturate(0.6).fade(0.4).rgb().string();
            return { "background-color": props.inHidden ? fadedColor : baseColor };
        });

        return { style };
    }
});
</script>
