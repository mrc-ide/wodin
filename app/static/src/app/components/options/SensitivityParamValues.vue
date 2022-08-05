<template>
  <div v-if="batchPars" class="alert alert-success mt-2" role="alert">
    <vue-feather type="check" style="vertical-align: bottom;"></vue-feather>
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
        }
    },
    components: {
      VueFeather
    },
    setup(props) {
        const paramValues = computed(() => props.batchPars?.values || []);
        const valuesText = computed(() => {
            const formatValue = format(".3f");
            const { length } = paramValues.value;
            const arrStart = paramValues.value.slice(0, 3);
            const start = arrStart.map((n) => formatValue(n)).join(", ");
            const ellipsis = length > 4 ? "...," : "";
            const end = length > 3 ? formatValue(paramValues.value[length - 1]) : "";

            return `${start}${ellipsis}${end}`;
        });
        return {
            valuesText
        };
    }
});
</script>
