<template>
    <div class="container mt-2">
        <button
            id="create-param-set"
            class="btn btn-primary"
            :disabled="!canCreateParameterSet"
            @click="createParameterSet"
        >
            Save Current Parameters
        </button>
        <div class="form-check mt-1">
            <input
                class="form-check-input"
                type="checkbox"
                :checked="showUnchangedParameters"
                @input="toggleShowUnchangedParameters"
                id="unchangedParamsCheck"
            />
            <label class="form-check-label" for="unchangedParamsCheck"> Show unchanged parameters </label>
        </div>
    </div>

    <div v-if="parameterSets?.length === 0" class="container mt-1">
        <p class="small fst-italic">Saved parameter sets will show here</p>
    </div>
    <parameter-set-view
        v-else
        v-for="(paramSet, index) in parameterSets"
        :parameter-set="paramSet"
        :index="index"
        class="mt-2"
        :key="`saved-parameterSet-${paramSet.name}`"
    >
    </parameter-set-view>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ParameterSetView from "./ParameterSetView.vue";
import { RunAction } from "../../store/run/actions";
import { RunMutation } from "../../store/run/mutations";
import { RunGetter } from "../../store/run/getters";
import { ParameterSet } from "../../store/run/state";

export default defineComponent({
    name: "ParameterSets",
    components: { ParameterSetView },
    setup() {
        const store = useStore();
        const parameterSets = computed(() => store.state.run.parameterSets);

        const showUnchangedParameters = computed(() => store.state.run.showUnchangedParameters);
        const toggleShowUnchangedParameters = () => {
            store.commit(`run/${RunMutation.ToggleShowUnchangedParameters}`);
        };
        const createParameterSet = () => {
            store.dispatch(`run/${RunAction.NewParameterSet}`);
        };

        const runRequired = computed(() => store.getters[`run/${RunGetter.runIsRequired}`]);
        const canCreateParameterSet = computed(() => {
            if (store.state.model.compileRequired || runRequired.value) {
                return false;
            }
            // do not allow set to be created when a duplicate set already exists
            const duplicateExists = store.state.run.parameterSets.some(
                (ps: ParameterSet) =>
                    JSON.stringify(ps.parameterValues) === JSON.stringify(store.state.run.parameterValues)
            );
            return !duplicateExists;
        });

        return {
            parameterSets,
            canCreateParameterSet,
            createParameterSet,
            showUnchangedParameters,
            toggleShowUnchangedParameters
        };
    }
});
</script>
