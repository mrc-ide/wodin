import { DirectiveBinding } from "vue";
import { Tooltip } from "bootstrap";

export interface ToolTipSettings {
    content?: string;
    trigger?: bootstrap.Tooltip.Options["trigger"];
    variant?: "text" | "error" | "warning" | "success";
    placement?: bootstrap.Tooltip.PopoverPlacement;
    delayMs?: number;
}

type TooltipWithConfig = Tooltip & { _config: Tooltip.Options }

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | ToolTipSettings>): void {
        const { value } = binding;

        el.setAttribute("data-bs-toggle", "tooltip");

        if (typeof value === "string") {
            // disabling no-new lint error as bootstrap
            // needs the new keyword
            new Tooltip(el, {
                title: value,
                placement: "top",
                trigger: "hover",
                animation: false
            });
        } else {
            const variant = value?.variant || "text";
            new Tooltip(el, {
                title: value?.content || "",
                placement: value?.placement || "top",
                trigger: value?.trigger || "hover",
                customClass: variant === "text" ? "" : `tooltip-${variant}`,
                animation: false,
                delay: { show: value?.delayMs || 0, hide: 0 }
            });
        }
    },
    beforeUpdate(el: HTMLElement, binding: DirectiveBinding<string | ToolTipSettings>): void {
        const { value } = binding;

        let tooltip = Tooltip.getInstance(el) as TooltipWithConfig;

        if (typeof value !== "string" && tooltip) {
            const variant = value?.variant || "text";
            const oldCustomClass = variant === "text" ? "" : `tooltip-${variant}`;

            const isVariantSame = tooltip._config.customClass === oldCustomClass;
            if (!isVariantSame) {
                tooltip.dispose();

                tooltip = new Tooltip(el, {
                    title: value?.content || "",
                    placement: value?.placement || "top",
                    trigger: value?.trigger || "hover",
                    customClass: variant === "text" ? "" : `tooltip-${variant}`,
                    animation: false,
                    delay: { show: value?.delayMs || 0, hide: 0 }
                }) as TooltipWithConfig;
            }
        }

        const content = typeof value === "string" ? value : value?.content || "";

        if (tooltip) {
            tooltip._config.title = content;
            const { trigger } = tooltip._config;
            if (trigger === "manual") {
                if (!content) {
                    tooltip.hide();
                } else {
                    tooltip.show();
                }
            }
        }
    },
    beforeUnmount(el: HTMLElement): void {
        const tooltip = Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    }
};
