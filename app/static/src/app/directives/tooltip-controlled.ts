import { Tooltip } from "bootstrap";
import { DirectiveBinding } from 'vue';

export interface ToolTipContent {
    content?: string,
    variant?: "text" | "error"| "warning" | "success",
    placement?: "top" | "bottom" | "left" | "right",
};

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<ToolTipContent>) {
        const { value } = binding;

        el.setAttribute("data-bs-toggle", "tooltip");
        const variant = value?.variant || "text";

        new Tooltip(el, {
            title: value?.content || "",
            placement: value?.placement || "top",
            trigger: "manual",
            customClass: (variant === "text") ? "" : `tooltip-${variant}`
        });
    },
    beforeUpdate(el: HTMLElement, binding: DirectiveBinding<ToolTipContent>) {
        const { value } = binding;

        const tooltip = Tooltip.getInstance(el);
        const content = value?.content || "";

        if (tooltip) {
            (tooltip as any)._config.title = content;
            if (!content) {
                tooltip.hide();
            }
            tooltip.show();
        }
    },
    beforeUnmount(el: HTMLElement) {
        const tooltip = Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    }
};
