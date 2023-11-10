<template>
  <div class="container">
    <div v-if="columnToFit" class="row my-2">
      <div class="col-5">
        <label class="col-form-label">Target to fit</label>
      </div>
      <div class="col-6">
        <select v-if="columnsWithLinks.length > 1" class="form-select" @change="updateColumnToFit" :value="columnToFit">
          <option v-for="col in columnsWithLinks" :value="col" :key="col">
            {{ labelForLinkedCol(col) }}
          </option>
        </select>
        <label class="col-form-label" id="target-fit-label" v-else>{{ labelForLinkedCol(columnToFit) }}</label>
      </div>
    </div>
    <div v-else class="row my-2">
      {{ columnToFitPrerequisitesMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { FitDataAction } from "../../store/fitData/actions";
import userMessages from "../../userMessages";

export default defineComponent({
  name: "OptimisationOptions",
  setup() {
    const store = useStore();
    const columnToFit = computed(() => store.state.fitData.columnToFit);
    const linkedVariables = computed(() => store.state.fitData.linkedVariables);
    const columnsWithLinks = computed(() => {
      return Object.keys(linkedVariables.value).filter((col) => !!linkedVariables.value[col]);
    });

    const updateColumnToFit = (e: Event) => {
      const col = (e.target as HTMLInputElement).value;
      store.dispatch(`fitData/${FitDataAction.UpdateColumnToFit}`, col);
    };

    const labelForLinkedCol = (col: string) => `${col} ~ ${linkedVariables.value[col]}`;

    const columnToFitPrerequisitesMessage = userMessages.fitData.columnToFitPrerequisites;

    return {
      columnToFit,
      columnsWithLinks,
      linkedVariables,
      columnToFitPrerequisitesMessage,
      updateColumnToFit,
      labelForLinkedCol
    };
  }
});
</script>
