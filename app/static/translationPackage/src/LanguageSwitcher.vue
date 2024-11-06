<template>
    <div v-if="enableI18n" class="navbar-text navbar-version me-3">
        <drop-down :text="languagesKeys[currentLanguage]">
            <template v-slot:items>
                <li v-for="(language, i18n, index) in languagesKeys" :key="index">
                    <span class="dropdown-item" @click="changeLang(i18n)">{{ language }}</span>
                </li>
            </template>
        </drop-down>
    </div>
</template>
<script lang="ts">
import { PropType, computed, defineComponent } from "vue";
import DropDown from "./DropDown.vue";
import { useStore } from "vuex";
import { LanguageAction } from "../store/actions";

type LanguageKeys = Record<string, string>;

export default defineComponent({
    name: "LanguageSwitcher",
    components: {
        DropDown
    },
    props: {
        languagesKeys: {
            type: Object as PropType<LanguageKeys>,
            required: true
        }
    },
    setup() {
        const store = useStore();
        const currentLanguage = computed(() => store.state.language.currentLanguage);
        const enableI18n = computed(() => store.state.language.enableI18n);
        const changeLang = (language: string) => {
            store.dispatch(`language/${LanguageAction.UpdateLanguage}`, language);
        };

        return {
            changeLang,
            currentLanguage,
            enableI18n
        };
    }
});
</script>
