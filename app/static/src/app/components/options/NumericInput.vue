<template>
  <input class="form-control parameter-input"
         type="text"
         :value="textValue"
         @input="updateValue"
         @blur="formatTextValue(true)"
         v-tooltip="tooltipProps"
         :placeholder="`${placeholder}`"/>
</template>

<script lang="ts">
import { formatLocale } from "d3-format";
import {
    defineComponent, ref, onMounted, watch, PropType
} from "vue";
import { ToolTipSettings } from "../../directives/tooltip";

// Provide a d3 format which uses hyphen for negatives rather than minus sign
const d3Locale = formatLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["£", ""],
    minus: "-"
});

export type BoundTooltip = {
    error: { number: number, message?: string },
    warning: { number: number, message: string }
}

export default defineComponent({
    name: "NumericInput",
    props: {
        value: {
            type: [Number, null] as PropType<number | null>,
            required: true
        },
        placeholder: {
            type: [Number, String],
            required: false,
            default: ""
        },
        maxAllowed: {
            type: [Number, Array] as PropType<number | BoundTooltip>,
            default: Infinity
        },
        minAllowed: {
            type: [Number, Array] as PropType<number | BoundTooltip>,
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

        const tooltipProps = ref<ToolTipSettings>({
            content: "",
            variant: "error",
            placement: "right",
            trigger: "manual"
        });

        const formatTextValue = (blur?: boolean) => {
            // display value with thousands formats
            if (props.value !== null) {
                textValue.value = d3Locale.format(",")(props.value);
            } else {
                textValue.value = "";
            }

            if (blur) {
                // wrap tooltip props update with update to input box
                // as the v-tooltip directive needs an update to actually
                // hide the tooltip
                textValue.value = `${textValue.value} `;
                tooltipProps.value.content = "";
                textValue.value = textValue.value.trim();
            }
        };

        const setMinTooltip = (
            min: number,
            msg: string | undefined = undefined,
            variant: ToolTipSettings["variant"] = "error"
        ) => {
            const defaultMsg = (min === 0)
                ? "Please enter a non-negative number"
                : `Please enter a value no less than ${min}`;
            tooltipProps.value.content = msg || defaultMsg;
            tooltipProps.value.variant = variant;
        };

        const setMaxTooltip = (
            max: number,
            msg: string | undefined = undefined,
            variant: ToolTipSettings["variant"] = "error"
        ) => {
            const defaultMsg = `Please enter a value no greater than ${max}`;
            tooltipProps.value.content = msg || defaultMsg;
            tooltipProps.value.variant = variant;
        };

        const boundValidation = (numeric: number) => {
            if (typeof props.maxAllowed === "number" && numeric > props.maxAllowed) {
                setMaxTooltip(props.maxAllowed);
                return props.maxAllowed;
            }

            if (typeof props.minAllowed === "number" && numeric < props.minAllowed) {
                setMinTooltip(props.minAllowed);
                return props.minAllowed;
            }

            if (typeof props.maxAllowed === "object") {
                const { error, warning } = props.maxAllowed;
                if (numeric > error.number) {
                    setMaxTooltip(error.number, error.message);
                    return error.number;
                } if (numeric > warning.number) {
                    setMaxTooltip(warning.number, warning.message, "warning");
                    return numeric;
                }
            }

            if (typeof props.minAllowed === "object") {
                const { error, warning } = props.minAllowed;
                if (numeric < error.number) {
                    setMaxTooltip(error.number, error.message);
                    return error.number;
                } if (numeric < warning.number) {
                    setMaxTooltip(warning.number, warning.message, "warning");
                    return numeric;
                }
            }

            tooltipProps.value.content = "";
            return numeric;
        };

        const updateValue = (event: Event) => {
            // 1. Apply character mask - only allow numerics, decimal point, comma, and hyphen (for negatives)
            const element = event.target as HTMLInputElement;
            let newVal = element.value.replace(/[^0-9,.-]/g, "");

            // only let there be a hyphen at the start of string
            if (newVal.length > 1) {
                newVal = newVal[0] + newVal.slice(1).replace("-", "");
            }

            // within the event handler we need to update the element directly to apply character mask as well as
            // updating reactive value
            textValue.value = newVal;
            element.value = newVal;

            // 2. Remove commas and parse to number, and emit update to container
            const cleanedValue = newVal.replace(/,/g, "");
            const numeric = parseFloat(cleanedValue);
            if (!Number.isNaN(numeric)) {
                const validatedNumeric = boundValidation(numeric);
                lastNumericValueSet.value = validatedNumeric;
                emit("update", validatedNumeric);
            } else if (props.placeholder) {
                lastNumericValueSet.value = null;
                emit("update", null);
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
            tooltipProps
        };
    }
});
</script>
