<template>
  <input class="form-control parameter-input"
         type="text"
         :value="textValue"
         @input="updateValue"
         @blur="formatTextValue"/>
</template>

<script lang="ts">
import { formatLocale } from "d3-format";
import {
    defineComponent, ref, onMounted, watch
} from "vue";

const parseNumber = (input: string) => parseFloat(input.replace(/,/g, ""));

// Provide a d3 format which uses hyphen for negatives rather than minus sign
const d3Locale = formatLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["£", ""],
    minus: "-"
});

export default defineComponent({
    name: "NumericInput",
    props: {
        value: {
            type: Number,
            required: true
        },
        allowNegative: {
            type: Boolean,
            default: true
        },
        maxAllowedValue: {
            type: Number,
            default: Infinity
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        // We want to correct user's poor formatting e.g. insert comma separators, but bad UX to do
        // this on every keystroke, so update text value on blur, mounted, and external value change (a change
        // to a value which wasn't the last one changed to here e.g. caused by model fit)
        const lastNumericValueSet = ref<null|number>(null);
        const textValue = ref("");

        const formatTextValue = () => {
            // display value with thousands formats
            textValue.value = d3Locale.format(",")(props.value);
        };

        const updateValue = (event: Event) => {
            // 1. Apply character mask - only allow numerics, decimal point, comma, and hyphen (for negatives)
            const element = event.target as HTMLInputElement;
            let newVal = element.value.replace(/[^0-9,.-]/g, "");
            if (!props.allowNegative) {
                newVal = newVal.replace("-", "");
            }
            let numeric = parseNumber(newVal);
            if (!Number.isNaN(numeric) && numeric > props.maxAllowedValue) {
                newVal = props.maxAllowedValue.toString();
                numeric = props.maxAllowedValue;
            }

            // within the event handler we need to update the element directly to apply character mask as well as
            // updating reactive value
            textValue.value = newVal;
            element.value = newVal;

            // 2. Remove commas and parse to number, and emit update to container
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
