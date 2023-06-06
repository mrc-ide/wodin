<template>
    <div v-if="enableI18n" class="navbar-text navbar-version ms-3 me-1">
        <drop-down :text="languagesKeys[currentLanguage]">
            <template v-slot:items>
                <li v-for="(language, i18n, index) in languagesKeys" :key="index">
                    <span class="dropdown-item"
                    @click="changeLang(i18n)">{{ language }}</span>
                </li>
            </template>
        </drop-down>
    </div>
</template>
<script lang="ts">
import { PropType, computed, defineComponent } from "vue";
import DropDown from "./DropDown.vue";
import VueFeather from "vue-feather";
import { useStore } from "vuex";
import { LanguageAction } from "../store/actions";

type LanguageKeys = Record<string, string>

export default defineComponent({
    name: "LanguageSwitcher",
    components: {
        DropDown,
        VueFeather
    },
    props: {
        languagesKeys: {
            type: Object as PropType<LanguageKeys>,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const currentLanguage = computed(() => store.state.language.currentLanguage);
        const enableI18n = computed(() => store.state.language.enableI18n);
        const changeLang = (language: string) => {
            store.dispatch(`language/${LanguageAction.UpdateLanguage}`, language);
        };

        return {
            languagesKeys: props.languagesKeys,
            changeLang,
            currentLanguage,
            enableI18n
        }
    }
});
</script>