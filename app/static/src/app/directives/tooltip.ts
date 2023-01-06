import {Tooltip} from "bootstrap";

export default {
    beforeMount(el: HTMLElement, binding: any) {
        const {value} = binding;
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
}