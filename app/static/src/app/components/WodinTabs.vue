<template>
    <div>
        <ul class="nav nav-tabs">
            <li v-for="tabName in tabNames" :key="tabName">
                <a class="nav-link"
                   :class="tabName === selectedTabName ? 'active' : ''"
                   aria-current="page"
                   href="#"
                   @click="tabSelected(tabName)">
                    {{ tabName }}
                </a>
            </li>
        </ul>
        <div class="mt-4">
            <slot :name="selectedTabName"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";

interface Props {
    tabNames: string[]
}

export default defineComponent({
    name: "WodinTabs",
    props: {
        tabNames: { type: Array as PropType<string[]>, required: true }
    },
    setup(props: Props) {
        const selectedTabName = ref(props.tabNames[0]);

        const tabSelected = (tabName: string) => {
            selectedTabName.value = tabName;
        };

        return {
            selectedTabName,
            tabSelected
        };
    }
});
</script>
