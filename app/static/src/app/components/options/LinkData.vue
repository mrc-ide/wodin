<template>
  <div class="container">
    <template v-if="dataColumns && modelSuccess">
      <div v-for="dataColumn in dataColumns" :key="dataColumn" class="row my-2">
        <div class="col-6">
          <label class="col-form-label">{{ dataColumn }}</label>
        </div>
        <div class="col-6">
            <select class="form-select"
                    @change="updateLinkedVariable(dataColumn, $event)" :value="linkedVariables[dataColumn] || ''">
              <option value="">-- no link --</option>
              <option v-for="modelVar in modelVariables" :value="modelVar" :key="modelVar">{{modelVar}}</option>
            </select>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="row my-2">
        {{ linkPrerequisitesMsg }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { FitDataMutation } from "../../store/fitData/mutations";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";

export default defineComponent({
    name: "LinkData",
    setup() {
        const namespace = "fitData";
        const store = useStore();
        const dataColumns = computed(() => store.getters[`${namespace}/${FitDataGetter.nonTimeColumns}`]);
        const modelSuccess = computed(() => store.state.model.odinModelResponse?.valid);
        const modelVariables = computed(() => store.state.model.odinModelResponse?.metadata.variables);
        const linkedVariables = computed(() => store.state.fitData.linkedVariables);

        const updateLinkedVariable = (dataColumn: string, event: Event) => {
            const selectValue = (event.target as HTMLSelectElement).value;
            const value = selectValue === "" ? null : selectValue;
            store.commit(`${namespace}/${FitDataMutation.SetLinkedVariable}`, { column: dataColumn, variable: value });
        };

        const linkPrerequisitesMsg = userMessages.fitData.linkPrerequisites;

        return {
            dataColumns,
            modelSuccess,
            modelVariables,
            linkedVariables,
            updateLinkedVariable,
            linkPrerequisitesMsg
        };
    }
});
</script>