import { Tooltip } from "bootstrap";
import { DirectiveBinding } from "vue";

export default {
    beforeMount(el: HTMLElement, binding: DirectiveBinding<string>) {
        const { value } = binding;
        el.setAttribute("data-bs-toggle", "tooltip");
        el.setAttribute("title", value);
        // eslint-disable-next-line no-new
        new Tooltip(el);
    },
    beforeUnmount(el: HTMLElement) {
        const tooltip = Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    }
};

