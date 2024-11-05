<template>
    <div v-if="batchPars" class="alert alert-success mt-2" role="alert">
        <vue-feather type="check" style="vertical-align: bottom"></vue-feather>
        {{ valuesText }}
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { format } from "d3-format";
import VueFeather from "vue-feather";
import { BatchPars } from "../../types/responseTypes";

export default defineComponent({
    name: "SensitivityParamValues",
    props: {
        batchPars: {
            type: Object as PropType<BatchPars>,
            required: false
        },
        paramName: {
            type: String,
            required: false
        }
    },
    components: {
        VueFeather
    },
    setup(props) {
        const paramValues = computed(() => {
            const varyingPar = props.batchPars?.varying.filter((v) => v.name === props.paramName);
            return varyingPar?.length ? varyingPar[0].values : [];
        });

        const valuesText = computed(() => {
            const formatValue = format(".3f");
            const { length } = paramValues.value;
            const arrStart = paramValues.value.slice(0, 3);
            const strVals = arrStart.map((n) => formatValue(n));
            if (length > 4) {
                strVals.push("...");
            }
            if (length > 3) {
                strVals.push(formatValue(paramValues.value[length - 1]));
            }
            return strVals.join(", ");
        });
        return {
            valuesText
        };
    }
});
</script>
