import { Tooltip } from "bootstrap";
import { DirectiveBinding } from 'vue';

interface ToolTipContent {
    content?: string,
    trigger?: "hover" | "focus" | "click" | "click focus" | "click hover" | "click hover focus" | "hover focus",
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
            trigger:  value?.trigger || "hover",
            customClass: (variant === "text") ? "" : `tooltip-${variant}`
        });
    },
    updated(el: HTMLElement, binding: DirectiveBinding<ToolTipContent>) {
        const { value } = binding;

        const tooltip = Tooltip.getInstance(el);
        const content = value?.content || "";

        if (tooltip) {
            el.setAttribute("data-bs-original-title", content);
        }
    },
    beforeUnmount(el: HTMLElement) {
        const tooltip = Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    }
};
