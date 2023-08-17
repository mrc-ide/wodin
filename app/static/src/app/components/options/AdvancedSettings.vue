<template>
    <div class="container" id="advanced-settings-panel">
        <div class="row my-2" v-for="(config, option) in advancedSettings" :key="option">
            <div class="col-5">
            <label class="col-form-label">{{ option }}</label>
            </div>
            <div class="col-6">
                <standard-form-input v-if="config.type === AdvancedComponentType.stdf"
                                     :value="config.val"
                                     :placeholder="config.default"
                                     @update="(n) => updateOption(n, option)"/>
                <numeric-input v-if="config.type === AdvancedComponentType.num"
                               :value="config.val"
                               :placeholder="config.default"
                               @update="(n) => updateOption(n, option)"/>
                <tag-input v-if="config.type === AdvancedComponentType.tag"
                               :tags="config.val"
                               @update="(n) => updateOption(n, option)"/>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import NumericInput from "./NumericInput.vue";
import StandardFormInput from "./StandardFormInput.vue";
import { AdvancedComponentType } from "../../store/run/state";
import { RunMutation } from "../../store/run/mutations";
import { AdvancedOptions } from "../../types/responseTypes";
import TagInput from "./TagInput.vue";
import { AppState } from "../../store/appState/state";

export default defineComponent({
    components: {
        NumericInput,
        StandardFormInput,
        TagInput
    },
    setup() {
        const store = useStore<AppState>();

        const advancedSettings = computed(() => store.state.run.advancedSettings);

        const updateOption = (newVal: number | null | [number|null, number|null], option: AdvancedOptions) => {
            store.commit(`run/${RunMutation.UpdateAdvancedSettings}`, { option, newVal });
        };

        return {
            advancedSettings,
            updateOption,
            AdvancedComponentType
        };
    }
});
</script>
