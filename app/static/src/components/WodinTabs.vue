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
import { defineComponent, ref, PropType } from "vue";

export default defineComponent({
    name: "WodinTabs",
    props: {
        tabNames: { type: Array as PropType<readonly string[]>, required: true },
        initSelectedTab: { type: String }
    },
    emits: ["tabSelected"],
    setup(props, { emit }) {
        const selectedTabName = ref(props.initSelectedTab || props.tabNames[0]);

        const tabSelected = (tabName: string) => {
            selectedTabName.value = tabName;
            emit("tabSelected", tabName);
        };

        return {
            selectedTabName,
            tabSelected
        };
    }
});
</script>
