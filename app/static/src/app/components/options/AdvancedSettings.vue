<template>
    <div class="container">
        <div class="row my-2" v-for="(config, option) in advancedSettings" :key="option">
            <div class="col-5">
            <label class="col-form-label">{{ option }}</label>
            </div>
            <div class="col-6">
                <standard-form-input v-if="config.standardForm"
                                     :value="config.val"
                                     :placeholder="config.defaults"
                                     @update="(n) => updateOption(n, option)"/>
                <numeric-input v-else
                               :value="config.val"
                               :placeholder="config.defaults"
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
import { AdvancedSettings, AdvancedOptions } from "../../store/run/state";
import { RunMutation } from "../../store/run/mutations";

export default defineComponent({
    components: {
        NumericInput,
        StandardFormInput
    },
    setup() {
        const store = useStore();

        const advancedSettings = computed(() => store.state.run.advancedSettings as AdvancedSettings);

        const updateOption = (newVal: number | null | (number|null)[], option: AdvancedOptions) => {
            store.commit(`run/${RunMutation.UpdateAdvancedSettings}`, { option, newVal });
        };

        return {
            advancedSettings,
            updateOption
        };
    }
});
</script>
