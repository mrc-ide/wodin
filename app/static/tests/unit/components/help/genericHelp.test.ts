import { mount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import GenericHelp from "../../../../src/components/help/GenericHelp.vue";
import DraggableDialog from "../../../../src/components/help/DraggableDialog.vue";

const mockTooltipDirective = vi.fn();
describe("GenericHelp", () => {
    const getWrapper = () => {
        return mount(GenericHelp, {
            props: {
                title: "Test Help Title",
                markdown: "# Test Markdown"
            },
            global: {
                directives: {
                    tooltip: mockTooltipDirective
                },
                stubs: {
                    MarkdownPanel: true
                }
            }
        });
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const icon = wrapper.findComponent(VueFeather);
        expect(icon.props("type")).toBe("help-circle");
        expect(mockTooltipDirective).toHaveBeenCalledTimes(1);
        expect(mockTooltipDirective.mock.calls[0][0]).toBe(icon.element);
        expect(mockTooltipDirective.mock.calls[0][1].value).toBe("Display help");
        expect(wrapper.findComponent(DraggableDialog).exists()).toBe(false);
    });

    it("shows dialog on click icon", async () => {
        const wrapper = getWrapper();
        await wrapper.findComponent(VueFeather).trigger("click");
        const dialog = wrapper.findComponent(DraggableDialog);
        expect(dialog.props("title")).toBe("Test Help Title");
        expect(dialog.find("markdown-panel-stub").attributes("markdown")).toBe("# Test Markdown");
    });

    it("hides dialog when it emits close event", async () => {
        const wrapper = getWrapper();
        await wrapper.findComponent(VueFeather).trigger("click");
        const dialog = wrapper.findComponent(DraggableDialog);
        await dialog.vm.$emit("close");
        expect(wrapper.findComponent(DraggableDialog).exists()).toBe(false);
    });
});
