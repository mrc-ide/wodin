<template>
  <div class="container">
    <template v-if="dataColumns && modelSuccess">
      <div v-for="dataColumn in dataColumns" class="row my-2">
        <div class="col-6">
          <label class="col-form-label">{{ dataColumn }}</label>
        </div>
        <div class="col-6">
            <select class="form-select">
              <option :value="null">-- no link --</option>
              <option v-for="modelVar in modelVariables" :value="modelVar" :key="modelVar">{{modelVar}}</option>
            </select>
        </div>
      </div>
    </template>
    <template v-else>
      no model fit data or no model
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent, computed} from "vue";
import {useStore} from "vuex";

export default defineComponent({
  name: "LinkData",
  setup() {
    const store = useStore();
    const dataColumns = computed(() => store.getters["fitData/nonTimeColumns"]); //TODO: use an enum for this
    const modelSuccess = computed(() => store.state.model.odinModelResponse?.valid);
    const modelVariables = computed(() => store.state.model.odinModelResponse?.metadata.variables);
    return {
      dataColumns,
      modelSuccess,
      modelVariables
    };
    // TODO: enforce must have at least 2 columns in data
    // TODO: Make a nice message for missing prerequisites
  }
});
</script>

