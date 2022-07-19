<template>
  <input class="form-control parameter-input"
         type="text"
         :value="textValue"
         @input="updateValue"
         @blur="formatTextValue"/>
</template>

<script lang="ts">
import { format } from "d3-format";
import {
    defineComponent, ref, onMounted, watch
} from "vue";

export default defineComponent({
    name: "NumericInput",
    props: {
        value: {
            type: Number,
            required: true
        }
    },
    setup(props, { emit }) {
        // We want to correct user's poor formatting e.g. insert comma separators, but bad UX to do
        // this on every keystroke, so update text value on blur, mounted, and external value change (a change
        // to a value which wasn't the last one changed to here e.g. caused by model fit)
        const lastNumericValueSet = ref<null|number>(null);
        const textValue = ref("");

        const formatTextValue = () => {
            // display value with thousands format
            textValue.value = format(",")(props.value);
        };

        const updateValue = (event: Event) => {
            // 1. Apply character mask - only allow numerics, decimal point and comma
            const element = event.target as HTMLInputElement;
            const newVal = element.value.replace(/[^0-9,.]/g, "");

            textValue.value = newVal;
            // within the event handler we need to update the element directly to apply character mask as well as
            // updating reactive value
            element.value = newVal;

            // 2. Remove commas and parse to number, and emit update to container
            const cleanedValue = newVal.replace(/,/g, "");
            const numeric = parseFloat(cleanedValue);
            if (!Number.isNaN(numeric)) {
                lastNumericValueSet.value = numeric;
                emit("update", numeric);
            }
        };

        onMounted(formatTextValue);
        watch(() => props.value, (newVal) => {
            if (newVal !== lastNumericValueSet.value) {
                formatTextValue();
            }
        });

        return {
            textValue,
            updateValue,
            formatTextValue
        };
    }
});
</script>
