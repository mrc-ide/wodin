import i18next from "i18next";
import { DirectiveBinding } from "vue";
import { Store } from "vuex";
import { LanguageState } from "../store/state";

interface LanguageStore {
    language: LanguageState
}

const translate = <S extends LanguageStore>(store: Store<S>) => {

    function _translateText(lng: string, el: HTMLElement, binding: DirectiveBinding) {
        const attribute = binding.arg;
        let translatedText = i18next.t(binding.value, {lng});
        if (binding.modifiers.lowercase) {
            translatedText = translatedText.toLowerCase()
        }
        if (attribute) {
            el.setAttribute(attribute, translatedText);
        } else {
            el.innerHTML = translatedText;
        }
    }

    function _addWatcher(el: HTMLElement, binding: DirectiveBinding) {
        const ele = el as any;
        ele.__lang_unwatch__ = ele.__lang_unwatch__ || {};
        if (binding.arg) {
            // this is an attribute binding
            ele.__lang_unwatch__[binding.arg] = store.watch(state => state.language.currentLanguage, lng => {
                _translateText(lng, el, binding);
            })
        } else {
            // this is a default, i.e. innerHTML, binding
            ele.__lang_unwatch__["innerHTML"] = store.watch(state => state.language.currentLanguage, lng => {
                _translateText(lng, el, binding);
            })
        }
    }

    function _removeWatcher(el: HTMLElement, binding: DirectiveBinding) {
        const ele = el as any;
        if (binding.arg) {
            // this is an attribute binding
            delete ele.__lang_unwatch__[binding.arg]
            // ele.__lang_unwatch__[binding.arg]()
        } else {
            // this is a default, i.e. innerHTML, binding
            delete ele.__lang_unwatch__["innerHTML"]
        }
    }

    function _validateBinding(el: HTMLElement, binding: DirectiveBinding): boolean {
        if (!binding.value) {
            console.warn("v-translate directive declared without a value", el);
            return false;
        }
        return true;
    }

    return {
        beforeMount(el: HTMLElement, binding: DirectiveBinding) {
            if (!_validateBinding(el, binding)) return;
            _translateText(store.state.language.currentLanguage, el, binding);
            _addWatcher(el, binding);
        },
        beforeUpdate(el: HTMLElement, binding: DirectiveBinding) {
            if (!_validateBinding(el, binding)) return;
            _removeWatcher(el, binding);
            _translateText(store.state.language.currentLanguage, el, binding);
            _addWatcher(el, binding);
        },
        beforeUnmount(el: HTMLElement, binding: DirectiveBinding) {
            if (!_validateBinding(el, binding)) return;
            _removeWatcher(el, binding);
        }
    }
};

export default translate;