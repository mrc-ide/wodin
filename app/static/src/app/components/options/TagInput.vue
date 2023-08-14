<template>
    <vue-tags-input style="border-color: #d7dce1;"
                    :v-model="value"
                    :tags="tags"
                    :add-tag-on-keys-when-select="true"
                    :allow-duplicates="false"
                    @on-remove="handleRemoveTag"
                    @on-new-tag="handleNewTag"/>
</template>
<script lang="ts">
import { PropType, computed, defineComponent, ref, watch } from 'vue';
import VueTagsInput from "vue3-tags-input";
import { Tag } from "../../store/run/state"

export default defineComponent({
    components: {
        VueTagsInput
    },
    props: {
        tags: Array as PropType<Tag[] | null>,
        placeholder: Array
    },
    setup(props, { emit }) {
        const value = ref("");

        const tags = computed(() => {
            if (props.tags?.length === 0 || !props.tags) {
                return [];
            } else {
                return props.tags.map((tag) => {
                    if (typeof tag === "number") {
                        return `${tag}`
                    } else {
                        return `${tag.id}: ${tag.value}`
                    }
                });
            }
        });

        const handleNewTag = (newTag: string) => {
            emit("select", newTag);
        };

        const handleRemoveTag = (index: number) => {
            emit("deselect", index);
        };

        return {
            value,
            tags,
            handleNewTag,
            handleRemoveTag
        }
    },
})
</script>
<style>
.v3ti-tag {
    background: #479fb6 !important;
}

.v3ti-tag .v3ti-remove-tag {
    text-decoration: none !important;
}
</style>