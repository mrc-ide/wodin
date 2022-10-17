<template>
    <div class="navbar-text">
        <drop-down>
            <template v-slot:items>
                <li v-for="(version, name, index) in versions" :key="index">
                    <span class="dropdown-item" style="cursor: default;">{{ name }} : v{{ version }}</span>
                </li>
            </template>
        </drop-down>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import DropDown from "../DropDown.vue";
import { VersionsAction } from "../../store/versions/actions";

export default defineComponent({
    name: "VersionMenu",
    components: {
        DropDown
    },
    setup() {
        const store = useStore();
        const versions = computed(() => store.state.versions.versions);
        onMounted(() => store.dispatch(`versions/${VersionsAction.GetVersions}`));
        return {
            versions
        };
    }
});
</script>
