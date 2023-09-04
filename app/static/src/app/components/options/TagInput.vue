<template>
    <vue-tags-input style="border-color: #d7dce1;"
                    v-model="currentTag"
                    :tags="computedTags"
                    :placeholder="'...'"
                    :validate="validate"
                    :add-tag-on-blur="true"
                    :add-tag-on-keys="[13, ',', 32, ':']"
                    @on-error="handleError"
                    @on-tags-changed="handleTagsChanged"/>
</template>
<script lang="ts">
import {
    PropType, computed, defineComponent, watch, ref
} from "vue";
import VueTagsInput from "vue3-tags-input";
import { useStore } from "vuex";
import { Tag } from "../../store/run/state";

export default defineComponent({
    components: {
        VueTagsInput
    },
    props: {
        tags: Array as PropType<Tag[] | null>,
        numericOnly: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props, { emit }) {
        const store = useStore();

        const currentTag = ref("");

        const paramValues = computed(() => store.state.run.parameterValues);

        watch(paramValues, () => {
            if (props.tags) {
                const stringTags = props.tags.filter((x) => typeof x === "string");
                if (stringTags.length > 0) {
                    emit("update", [...props.tags]);
                }
            }
        }, { deep: true });

        const computedTags = computed(() => {
            if (props.tags?.length === 0 || !props.tags) {
                return [];
            }
            const cleanTags = props.tags.filter((tag) => {
                if (typeof tag === "number") return true;
                return !props.numericOnly && paramValues.value[tag] !== undefined;
            });
            return cleanTags.map((tag) => {
                if (typeof tag === "number") return `${tag}`;
                const tagValue = paramValues.value[tag];
                return `${tag}: ${tagValue}`;
            });
        });

        const isNumeric = (value: string) => {
            return value.trim() !== "" && !Number.isNaN(Number(value));
        };

        const isParameterName = (tag: string) => {
            return paramValues.value && tag in paramValues.value;
        };

        const handleError = () => {
            // remove duplicate current tag
            currentTag.value = "";
        };

        const handleTagsChanged = (tags: string[]) => {
            const parsedTags = tags.map((tag) => {
                if (isNumeric(tag)) {
                    return parseFloat(tag);
                }
                if (!props.numericOnly) {
                    if (tag.includes(":")) {
                        const variableTag = tag.split(":");
                        const varId = variableTag[0];
                        if (isParameterName(varId)) {
                            return varId;
                        }
                    } else if (isParameterName(tag)) {
                        return tag;
                    }
                }
                return undefined;
            });
            const cleanTags = parsedTags.filter((x) => x !== undefined);
            emit("update", cleanTags);
        };

        const validate = (tag: string) => {
            let tagVal;
            if (tag.includes(":")) {
                [tagVal] = tag.split(":");
            } else if (isNumeric(tag)) {
                tagVal = parseFloat(tag);
            } else {
                tagVal = tag;
            }

            return !props.tags || (props.tags && !props.tags.includes(tagVal));
        };

        return {
            currentTag,
            computedTags,
            handleError,
            handleTagsChanged,
            validate
        };
    }
});
</script>
<style>
.v3ti-tag {
    background: #479fb6 !important;
}

.v3ti-tag .v3ti-remove-tag {
    text-decoration: none !important;
}

.v3ti-new-tag--error {
  text-decoration: none !important;
  color: #000 !important;
}
</style>
