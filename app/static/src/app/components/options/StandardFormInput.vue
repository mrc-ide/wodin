<template>
    <span style="display: grid; grid-template-columns: 1.5fr 0.75fr 1fr;">
        <numeric-input :value="value[0]"
                       @update="(n) => updateVals(0, n)"
                       :max-allowed="10"
                       :min-allowed="-10"
                       :placeholder="placeholder1"/>
        <span style="display: flex; justify-content: center; align-items: center;">x10^</span>
        <numeric-input :value="value[1]"
                       @update="(n) => updateVals(1, n)"
                       :placeholder="placeholder2"/>
    </span>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import NumericInput from "./NumericInput.vue";

export default defineComponent({
    components: {
        NumericInput
    },
    props: {
        value: {
            type: Array as PropType<(number|null)[]>,
            required: true
        },
        placeholder: Array as PropType<number[]>
    },
    setup(props, { emit }) {
        const placeholder1 = props?.placeholder ? props.placeholder[0] : "";
        const placeholder2 = props?.placeholder ? props.placeholder[1] : "";

        const updateVals = (index: number, newVal: number) => {
            const valsCopy = [...props.value];
            valsCopy[index] = newVal;
            emit("update", valsCopy);
        };

        return {
            placeholder1,
            placeholder2,
            updateVals
        };
    }
});
</script>
