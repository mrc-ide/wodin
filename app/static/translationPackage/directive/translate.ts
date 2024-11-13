import i18next from "i18next";
import { DirectiveBinding } from "vue";
import { Store } from "vuex";
import { LanguageState } from "../store/state";

interface LanguageStore {
    language: LanguageState;
}

type LangWatchElement = HTMLElement & { __lang_unwatch__: Record<string, () => void> }

const translate = <S extends LanguageStore>(store: Store<S>) => {
    function _translateText(lng: string, el: LangWatchElement, binding: DirectiveBinding) {
        const attribute = binding.arg;
        let translatedText = i18next.t(binding.value, { lng });
        if (binding.modifiers.lowercase) {
            translatedText = translatedText.toLowerCase();
        }
        if (attribute) {
            el.setAttribute(attribute, translatedText);
        } else {
            el.innerHTML = translatedText;
        }
    }

    function _addWatcher(el: LangWatchElement, binding: DirectiveBinding) {
        el.__lang_unwatch__ = el.__lang_unwatch__ || {};
        if (binding.arg) {
            // this is an attribute binding
            el.__lang_unwatch__[binding.arg] = store.watch(
                (state) => state.language.currentLanguage,
                (lng) => {
                    _translateText(lng, el, binding);
                }
            );
        } else {
            // this is a default, i.e. innerHTML, binding
            el.__lang_unwatch__["innerHTML"] = store.watch(
                (state) => state.language.currentLanguage,
                (lng) => {
                    _translateText(lng, el, binding);
                }
            );
        }
    }

    function _removeWatcher(el: LangWatchElement, binding: DirectiveBinding) {
        if (binding.arg) {
            // this is an attribute binding
            delete el.__lang_unwatch__[binding.arg];
            // el.__lang_unwatch__[binding.arg]()
        } else {
            // this is a default, i.e. innerHTML, binding
            delete el.__lang_unwatch__["innerHTML"];
        }
    }

    function _validateBinding(el: LangWatchElement, binding: DirectiveBinding): boolean {
        if (!binding.value) {
            console.warn("v-translate directive declared without a value", el);
            return false;
        }
        return true;
    }

    return {
        beforeMount(el: LangWatchElement, binding: DirectiveBinding) {
            if (!_validateBinding(el, binding)) return;
            _translateText(store.state.language.currentLanguage, el, binding);
            _addWatcher(el, binding);
        },
        beforeUpdate(el: LangWatchElement, binding: DirectiveBinding) {
            if (!_validateBinding(el, binding)) return;

            // first remove the existing watcher for this directive instance
            // since it has the previous value of the binding cached
            _removeWatcher(el, binding);

            // now re-add them with the new binding properties
            _translateText(store.state.language.currentLanguage, el, binding);
            _addWatcher(el, binding);
        },
        beforeUnmount(el: LangWatchElement, binding: DirectiveBinding) {
            if (!_validateBinding(el, binding)) return;
            _removeWatcher(el, binding);
        }
    };
};

export default translate;
