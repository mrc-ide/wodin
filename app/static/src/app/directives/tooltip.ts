import { Tooltip } from "bootstrap";
import { DirectiveBinding } from "vue";

const disposeTooltip = (el: HTMLElement) => {
    const tooltip = Tooltip.getInstance(el);
    if (tooltip) {
        tooltip.dispose();
    }
};

const setTooltip = (el: HTMLElement, binding: DirectiveBinding<string>) => {
    const { value } = binding;
    el.setAttribute("title", value);
    // eslint-disable-next-line no-new
    new Tooltip(el);
};

export default {
    beforeMount(el: HTMLElement, binding: DirectiveBinding<string>) {
        el.setAttribute("data-bs-toggle", "tooltip");
        setTooltip(el, binding);
    },
    beforeUnmount(el: HTMLElement) {
        disposeTooltip(el);
    },
    updated(el: HTMLElement, binding: DirectiveBinding<string>) {
        disposeTooltip(el);
        setTooltip(el, binding);
    }
};
