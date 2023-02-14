import { DirectiveBinding } from "vue";
import { Tooltip } from "bootstrap";

interface ToolTipContent {
    content?: string,
    trigger?: "hover" | "focus" | "click" | "click focus" | "click hover" | "click hover focus" | "hover focus",
    variant?: "text" | "error"| "warning" | "success",
    placement?: "top" | "bottom" | "left" | "right",
}

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | ToolTipContent>) {
        const { value } = binding;

        el.setAttribute("data-bs-toggle", "tooltip");

        if (typeof value === "string") {
            // disabling no-new lint error as bootstrap
            // needs the new keyword
            // eslint-disable-next-line no-new
            new Tooltip(el, {
                title: value || "",
                placement: "top",
                trigger: "hover"
            });
        } else {
            const variant = value?.variant || "text";
            // eslint-disable-next-line no-new
            new Tooltip(el, {
                title: value?.content || "",
                placement: value?.placement || "top",
                trigger: value?.trigger || "hover",
                customClass: (variant === "text") ? "" : `tooltip-${variant}`
            });
        }
    },
    beforeUpdate(el: HTMLElement, binding: DirectiveBinding<ToolTipContent>) {
        const { value } = binding;

        const tooltip = Tooltip.getInstance(el);
        const content = (typeof value === "string")
            ? value
            : value?.content || "";

        if (tooltip) {
            (tooltip as any)._config.title = content;
        }
    },
    beforeUnmount(el: HTMLElement) {
        const tooltip = Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    }
};
