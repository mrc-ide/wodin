<template>
  <div class="container">
    <template v-if="dataColumns && modelSuccess">
      <div v-for="dataColumn in dataColumns" class="row my-2">
        <div class="col-6">
          <label class="col-form-label">{{ dataColumn }}</label>
        </div>
        <div class="col-6">
            <select class="form-select" @change="updateLinkedVariable(dataColumn, $event)" v-model="linkedVariables[dataColumn]">
              <option :value="null">-- no link --</option>
              <option v-for="modelVar in modelVariables" :value="modelVar" :key="modelVar">{{modelVar}}</option>
            </select>
        </div>
      </div>
    </template>
    <template v-else>
      {{ linkPrerequisitesMsg }}
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
            const { value } = event.target as HTMLSelectElement;
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
    // TODO: show a warning/error if user selects same same variable to fit for multiple columns
    }
});
</script>
