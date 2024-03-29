<template>
    <div class="container" id="advanced-settings-panel">
        <div class="row my-2" v-for="(config, option) in advancedSettings" :key="option">
            <div class="col-5">
                <label class="col-form-label">{{ option }}</label>
            </div>
            <div class="col-6">
                <standard-form-input
                    v-if="config.type === AdvancedComponentType.stdf"
                    :value="config.val"
                    :placeholder="config.default"
                    @update="(n) => updateOption(n, option)"
                />
                <numeric-input
                    v-if="config.type === AdvancedComponentType.num"
                    :value="config.val"
                    :placeholder="config.default"
                    @update="(n) => updateOption(n, option)"
                />
                <tag-input
                    v-if="config.type === AdvancedComponentType.tag"
                    :tags="config.val"
                    @update="(n) => updateOption(n, option)"
                />
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
import { AppState, AppType } from "../../store/appState/state";
import { ModelFitMutation } from "../../store/modelFit/mutations";
import { BaseSensitivityMutation } from "../../store/sensitivity/mutations";

export default defineComponent({
    components: {
        NumericInput,
        StandardFormInput,
        TagInput
    },
    setup() {
        const store = useStore<AppState>();

        const advancedSettings = computed(() => store.state.run.advancedSettings);
        const isFit = computed(() => store.state.appType === AppType.Fit);

        const updateOption = (newVal: number | null | [number | null, number | null], option: AdvancedOptions) => {
            store.commit(`run/${RunMutation.UpdateAdvancedSettings}`, { option, newVal });
            if (isFit.value) {
                store.commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { advancedSettingsChanged: true });
            }
            store.commit(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`, { advancedSettingsChanged: true });
            if (store.state.config?.multiSensitivity) {
                store.commit(`multiSensitivity/${BaseSensitivityMutation.SetUpdateRequired}`, {
                    advancedSettingsChanged: true
                });
            }
        };

        return {
            advancedSettings,
            updateOption,
            AdvancedComponentType
        };
    }
});
</script>
