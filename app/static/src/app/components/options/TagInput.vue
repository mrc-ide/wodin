<template>
    <vue-tags-input style="border-color: #d7dce1;"
                    :tags="computedTags"
                    :placeholder="JSON.stringify(placeholder)"
                    :validate="validate"
                    @on-tags-changed="handleTagsChanged"/>
</template>
<script lang="ts">
import {
    PropType, computed, defineComponent
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
        placeholder: Array
    },
    setup(props, { emit }) {
        const store = useStore();

        const paramValues = computed(() => store.state.run.parameterValues);

        const computedTags = computed(() => {
            if (props.tags?.length === 0 || !props.tags) {
                return [];
            }
            const parsedTags = props.tags.map((tag) => {
                if (typeof tag === "number") {
                    return `${tag}`;
                }
                const tagValue = paramValues.value[tag];
                if (tagValue !== undefined) {
                    return `${tag}: ${tagValue}`;
                }
                return undefined;
            });
            return parsedTags.filter((x) => x !== undefined);
        });

        const isNumeric = (num: any) => {
            return num.trim() !== "" && !Number.isNaN(Number(num));
        };

        const handleTagsChanged = (tags: string[]) => {
            const parsedTags = tags.map((tag) => {
                if (isNumeric(tag)) {
                    return parseFloat(tag);
                } if (tag.includes(":")) {
                    const variableTag = tag.split(":");
                    const varId = variableTag[0];
                    if (paramValues.value && varId in paramValues.value) {
                        return varId;
                    }
                } else if (paramValues.value && tag in paramValues.value) {
                    return tag;
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
            computedTags,
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
</style>
