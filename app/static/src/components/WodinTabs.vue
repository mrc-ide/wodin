<template>
    <div>
        <ul class="nav nav-tabs">
            <li v-for="tabName in tabNames" :key="tabName">
                <a
                    class="nav-link"
                    :class="tabName === selectedTabName ? 'active' : ''"
                    aria-current="page"
                    href="#"
                    @click="tabSelected(tabName)"
                >
                    {{ tabName }}
                </a>
            </li>
        </ul>
        <div class="mt-4 px-2">
            <slot :name="selectedTabName" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from "vue";

interface Props {
    tabNames: string[];
    tab?: string | undefined;
}

export default defineComponent({
    name: "WodinTabs",
    props: {
        tabNames: { type: Array as PropType<string[]>, required: true },
        tab: { type: String, required: false },
    },
    emits: ["tabSelected"],
    setup(props: Props, { emit }) {
        // eslint-disable-next-line vue/no-setup-props-destructure
        const selectedTabName = ref(props.tab || props.tabNames[0]);

        const tabSelected = (tabName: string) => {
            if (!props.tab) selectedTabName.value = tabName;
            emit("tabSelected", tabName);
        };

        watch(() => [props.tab], ([newTab]) => {
            if (newTab) selectedTabName.value = newTab;
        });

        return {
            selectedTabName,
            tabSelected
        };
    }
});
</script>
