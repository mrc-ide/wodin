import {DirectiveBinding} from "vue";
import tooltip from "./tooltip";
import userMessages from "../userMessages";
import {Dict} from "../types/utilTypes";

export default {
    beforeMount(el: HTMLElement, binding: DirectiveBinding<string>) {
        // TODO: is still shown after click, even after move away!
        const { value } = binding; // value should be key in userStrings.help
        const helpString = (userMessages.help as Dict<string>)[value];
        tooltip.beforeMount(el, {...binding, value: helpString});
    },
    beforeUnmount(el: HTMLElement) {
       tooltip.beforeUnmount(el);
    }
};