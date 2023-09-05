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
    number: number,
    variant?: ToolTipSettings["variant"],
    message: string
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
            type: [Number, Array] as PropType<number | BoundTooltip[]>,
            default: Infinity
        },
        minAllowed: {
            type: [Number, Array] as PropType<number | BoundTooltip[]>,
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

        const validateArray = (arr: BoundTooltip[], numeric: number, ascending: boolean) => {
            arr.sort((x, y) => {
                if (x.number < y.number) return ascending ? -1 : 1;
                if (x.number > y.number) return ascending ? 1 : -1;
                return 0;
            });

            const condition = (compareNum: number) => {
                return ascending ? numeric > compareNum : numeric < compareNum;
            };

            arr.forEach((bound) => {
                if (condition(bound.number)) {
                    tooltipProps.value.content = bound.message;
                    tooltipProps.value.variant = bound.variant || "error";
                }
            });
        };

        const minMaxValidation = (numeric: number) => {
            if (typeof props.maxAllowed === "number") {
                if (numeric > props.maxAllowed) {
                    tooltipProps.value.content = `Please enter a value no greater than ${props.maxAllowed}`;
                    return props.maxAllowed;
                }
                tooltipProps.value.content = "";
            }

            if (typeof props.minAllowed === "number") {
                if (numeric < props.minAllowed) {
                    tooltipProps.value.content = (props.minAllowed === 0)
                        ? "Please enter a non-negative number"
                        : `Please enter a value no less than ${props.minAllowed}`;
                    return props.minAllowed;
                }
                tooltipProps.value.content = "";
            }

            if (Array.isArray(props.maxAllowed) && props.maxAllowed.length > 0) {
                const maxesAllowed = [...props.maxAllowed] as BoundTooltip[];
                validateArray(maxesAllowed, numeric, true);

                if (numeric > maxesAllowed.at(-1)!.number) {
                    return maxesAllowed.at(-1)!.number;
                }
                if (numeric <= maxesAllowed[0].number) {
                    tooltipProps.value.content = "";
                }
            }

            if (Array.isArray(props.minAllowed) && props.minAllowed.length > 0) {
                const minsAllowed = [...props.minAllowed] as BoundTooltip[];
                validateArray(minsAllowed, numeric, false);

                if (numeric < minsAllowed.at(-1)!.number) {
                    return minsAllowed.at(-1)!.number;
                }
                if (numeric >= minsAllowed[0].number) {
                    tooltipProps.value.content = "";
                }
            }

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
                const validatedNumeric = minMaxValidation(numeric);
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
