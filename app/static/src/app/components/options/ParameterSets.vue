<template>
  <div class="container mt-2">
    <button id="create-param-set"
            class="btn btn-primary"
            :disabled="!canCreateParameterSet"
            @click="createParameterSet">
      Save Current Parameters
    </button>
  </div>
  <parameter-set-view v-for="(paramSet, index) in parameterSets"
                      :parameter-set="paramSet"
                      :index="index"
                      class="mt-2"
                      :key="paramSet.name">
  </parameter-set-view>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ParameterSetView from "./ParameterSetView.vue";
import { RunAction } from "../../store/run/actions";
import { RunGetter } from "../../store/run/getters";
import { ParameterSet } from "../../store/run/state";

export default defineComponent({
    name: "ParameterSets",
    components: { ParameterSetView },
    setup() {
        const store = useStore();
        const parameterSets = computed(() => store.state.run.parameterSets);

        const createParameterSet = () => {
            store.dispatch(`run/${RunAction.NewParameterSet}`);
        };

        const runRequired = computed(() => store.getters[`run/${RunGetter.runIsRequired}`]);
        const canCreateParameterSet = computed(() => {
            if (store.state.model.compileRequired || runRequired.value) {
                return false;
            }

            // do not allow set to be created when a duplicate set already exists
            const currentValues = store.state.run.parameterValues;
            const duplicateExists = store.state.run.parameterSets
                .some((ps: ParameterSet) => JSON.stringify(ps.parameterValues) === JSON.stringify(currentValues));
            return !duplicateExists;
        });

        return {
            parameterSets,
            canCreateParameterSet,
            createParameterSet
        };
    }
});
</script>
