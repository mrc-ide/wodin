import { DirectiveBinding } from "vue";
import tooltip, { ToolTipSettings } from "./tooltip";
import userMessages from "../userMessages";
import { Dict } from "../types/utilTypes";

const getHelpBinding = (binding: DirectiveBinding<string>) => {
    const { value } = binding; // value should be key in userMessages.help
    const helpString = (userMessages.help as Dict<string>)[value as string];
    const settings: ToolTipSettings = { content: helpString, delayMs: 500 };
    return { ...binding, value: settings } as DirectiveBinding<string | ToolTipSettings>;
};

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
        tooltip.mounted(el, getHelpBinding(binding));
    },
    beforeUpdate(el: HTMLElement, binding: DirectiveBinding<string>) {
        tooltip.beforeUpdate(el, getHelpBinding(binding));
    },
    beforeUnmount(el: HTMLElement) {
        tooltip.beforeUnmount(el);
    }
};
