import { DirectiveBinding } from "vue";
import { Tooltip } from "bootstrap";

export interface ToolTipSettings {
    content?: string,
    trigger?: bootstrap.Tooltip.Options["trigger"],
    variant?: "text" | "error"| "warning" | "success",
    placement?: bootstrap.Tooltip.PopoverPlacement,
    delayMs?: number
}

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | ToolTipSettings>) {
        const { value } = binding;

        el.setAttribute("data-bs-toggle", "tooltip");

        if (typeof value === "string") {
            // disabling no-new lint error as bootstrap
            // needs the new keyword
            // eslint-disable-next-line no-new
            new Tooltip(el, {
                title: value,
                placement: "top",
                trigger: "hover",
                animation: false
            });
        } else {
            const variant = value?.variant || "text";
            // eslint-disable-next-line no-new
            new Tooltip(el, {
                title: value?.content || "",
                placement: value?.placement || "top",
                trigger: value?.trigger || "hover",
                customClass: (variant === "text") ? "" : `tooltip-${variant}`,
                animation: false,
                delay: { show: value?.delayMs || 0, hide: 0 }
            });
        }
    },
    beforeUpdate(el: HTMLElement, binding: DirectiveBinding<string | ToolTipSettings>) {
        const { value } = binding;

        const tooltip = Tooltip.getInstance(el);
        const content = (typeof value === "string")
            ? value
            : value?.content || "";

        if (tooltip) {
            (tooltip as any)._config.title = content;
            const { trigger } = (tooltip as any)._config;
            if (trigger === "manual") {
                if (!content) {
                    tooltip.hide();
                } else {
                    tooltip.show();
                }
            }
        }
    },
    beforeUnmount(el: HTMLElement) {
        const tooltip = Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    }
};
