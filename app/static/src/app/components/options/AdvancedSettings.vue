<template>
    <div class="container">
        <div class="row my-2" v-for="(config, option) in advancedSettings" :key="option">
            <div class="col-5">
            <label class="col-form-label">{{ option }}</label>
            </div>
            <div class="col-6">
                <standard-form-input v-if="config.type === AdSettingCompType.stdf"
                                     :value="config.val"
                                     :placeholder="config.defaults"
                                     @update="(n) => updateOption(n, option)"/>
                <numeric-input v-if="config.type === AdSettingCompType.num"
                               :value="config.val"
                               :placeholder="config.defaults"
                               @update="(n) => updateOption(n, option)"/>
                <tag-input v-if="config.type === AdSettingCompType.tag"
                               :tags="config.val"
                               :placeholder="config.defaults"
                               @select="(n) => selectTag(n, option)"
                               @deselect="(n) => removeTag(n, option)" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import NumericInput from "./NumericInput.vue";
import StandardFormInput from "./StandardFormInput.vue";
import { AdSettingCompType, Tag } from "../../store/run/state";
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

        const paramValues = computed(() => store.state.run.parameterValues);

        const updateOption = (newVal: number | null | [number|null, number|null], option: AdvancedOptions) => {
            store.commit(`run/${RunMutation.UpdateAdvancedSettings}`, { option, newVal });
        };

        const isNumeric = (num: any) => {
            return num.trim() !== "" && !isNaN(num as number);
        };

        const selectTag = (newVal: string, option: AdvancedOptions) => {
            let tag: Tag | number | null = null;
            const currTags = advancedSettings.value[option].val as Tag[] | null;

            if (isNumeric(newVal)) {
                tag = parseFloat(newVal);
            } else {
                if (paramValues.value && paramValues.value.hasOwnProperty(newVal)) {
                    tag = {
                        id: newVal,
                        value: paramValues.value[newVal]
                    };
                }
            }

            let newTags: Tag[] | null = null;
            if (tag === null) {
                //handle error
                if (currTags) {
                    newTags = [...currTags];
                } else {
                    newTags = null;
                }
            } else {
                if (currTags) {
                    const tagVariables = currTags.map((tag) => {
                        if (typeof tag === "number") {
                            return tag
                        } else {
                            return tag.id
                        }
                    });
                    if (typeof tag !== "number" && tagVariables.includes(tag.id)
                        || typeof tag === "number" && tagVariables.includes(tag)) {
                        newTags = [...currTags];
                    } else {
                        newTags = [...currTags, tag];
                    }
                } else {
                    newTags = [tag];
                }
            }

            store.commit(`run/${RunMutation.UpdateAdvancedSettings}`, { option, newVal: newTags });
        };

        const removeTag = (index: number, option: AdvancedOptions) => {
            if (advancedSettings.value[option].val) {
                const copy = [...advancedSettings.value[option].val as Tag[]];
                copy.splice(index, 1);
                console.log(copy)
                store.commit(`run/${RunMutation.UpdateAdvancedSettings}`, { option, newVal: copy });
            }
        };

        return {
            advancedSettings,
            updateOption,
            AdSettingCompType,
            selectTag,
            removeTag
        };
    }
});
</script>
