import { DirectiveBinding } from "vue";
import tooltip, { ToolTipSettings } from "./tooltip";
import userMessages from "../userMessages";
import { Dict } from "../types/utilTypes";

const lookupHelpStringFromBinding = (binding: DirectiveBinding<string>) => {
    const { value } = binding; // value should be key in userMessages.help
    return (userMessages.help as Dict<string>)[value as string];
};

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
        const helpString = lookupHelpStringFromBinding(binding);
        tooltip.mounted(el, { ...binding, value: helpString } as DirectiveBinding<string | ToolTipSettings>);
    },
    beforeUpdate(el: HTMLElement, binding: DirectiveBinding<string>) {
        const helpString = lookupHelpStringFromBinding(binding);
        tooltip.beforeUpdate(el, { ...binding, value: helpString } as DirectiveBinding<string | ToolTipSettings>);
    },
    beforeUnmount(el: HTMLElement) {
        tooltip.beforeUnmount(el);
    }
};
