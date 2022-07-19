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
      //pattern="^\d{1,3}(,?\d{3})*(\.\d+)?$"

        // We want to correct user's poor formatting e.g. insert comma separators, but bad UX to do
        // this on every keystroke, so update text value on blur, mounted, and external value change (a change
        // to a value which wasn't the last one changed to here e.g. caused by model fit)
        const lastNumericValueSet = ref<null|number>(null);
        const textValue = ref("");

        const formatTextValue = () => {
            console.log("formatting");
            // display value with thousands format
            textValue.value = format(",")(props.value);
            console.log(`Set textValue to ${textValue.value}`);
        };

        const updateValue = (event: Event) => {
            const element = event.target as HTMLInputElement;
            const newVal = element.value;
            textValue.value = newVal;
            console.log("updatingValue");
            // take out commas should be able to parse
            const cleanedValue = newVal.replace(/,/g, "");
            console.log(`cleanedValue: ${cleanedValue}`);
            const numeric = parseFloat(cleanedValue);
            console.log(`numeric: ${numeric}`);
            if (!Number.isNaN(numeric)) {
                console.log("emitting numeric");
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
