<template>
  <input class="form-control parameter-input"
         type="text"
         :value="textValue"
         @input="updateValue"
         @blur="formatTextValue(true)"
         v-tooltip-controlled="errorTooltipProps"/>
</template>

<script lang="ts">
import { formatLocale } from "d3-format";
import {
    defineComponent, ref, onMounted, watch
} from "vue";
import { ToolTipContent } from "../../directives/tooltip-controlled";

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
        max: {
            type: Number,
            default: Infinity
        },
        min: {
            type: Number,
            default: -Infinity
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        // We want to correct user's poor formatting e.g. insert comma separators, but bad UX to do
        // this on every keystroke, so update text value on blur, mounted, and external value change (a change
        // to a value which wasn't the last one changed to here e.g. caused by model fit)
        const lastNumericValueSet = ref<null|number>(null);
        const textValue = ref("");

        const errorTooltipProps: ToolTipContent = {
            content: "",
            variant: "error",
            placement: "right"
        }

        const formatTextValue = (blur?: boolean) => {
            // display value with thousands formats
            textValue.value = d3Locale.format(",")(props.value);
            if (blur) {
                errorTooltipProps.content = "";
            }
        };

        const updateValue = (event: Event) => {
            // 1. Apply character mask - only allow numerics, decimal point, comma, and hyphen (for negatives)
            const element = event.target as HTMLInputElement;
            let newVal = element.value.replace(/[^0-9,.-]/g, "");
            if (!props.allowNegative) {
                newVal = newVal.replace("-", "");
            }

            // within the event handler we need to update the element directly to apply character mask as well as
            // updating reactive value
            textValue.value = newVal;
            element.value = newVal;

            // 2. Remove commas and parse to number, and emit update to container
            const cleanedValue = newVal.replace(/,/g, "");
            const numeric = parseFloat(cleanedValue);
            if (!Number.isNaN(numeric)) {

                // min max validation
                var validatedNumeric: number = numeric;
                if (numeric <= props.max && numeric >= props.min) {
                    validatedNumeric = numeric;
                    errorTooltipProps.content = "";
                }
                if (numeric > props.max) {
                    validatedNumeric = props.max;
                    errorTooltipProps.content = `Please enter value less than ${props.max}`;
                }
                if (numeric < props.min) {
                    validatedNumeric = props.min;
                    errorTooltipProps.content = `Please enter value greater than ${props.min}`;
                }

                lastNumericValueSet.value = validatedNumeric;
                emit("update", validatedNumeric);
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
            formatTextValue,
            errorTooltipProps
        };
    }
});
</script>
