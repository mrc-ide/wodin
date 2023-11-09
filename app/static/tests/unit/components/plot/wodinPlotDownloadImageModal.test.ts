import { shallowMount } from "@vue/test-utils";
import WodinPlotDownloadImageModal from "../../../../src/app/components/plot/WodinPlotDownloadImageModal.vue";

describe("WodinPlotDownloadImageModal", () => {
    const getWrapper = () => {
        return shallowMount(WodinPlotDownloadImageModal, {
            props: {
                title: "Test Title",
                xLabel: "test x",
                yLabel: "test y"
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("label[for='download-img-title']").text()).toBe("Title");
        expect((wrapper.find("input#download-img-title").element as HTMLInputElement).value).toBe("Test Title");
        expect(wrapper.find("label[for='download-img-x-label']").text()).toBe("X axis label");
        expect((wrapper.find("input#download-img-x-label").element as HTMLInputElement).value).toBe("test x");
        expect(wrapper.find("label[for='download-img-y-label']").text()).toBe("Y axis label");
        expect((wrapper.find("input#download-img-y-label").element as HTMLInputElement).value).toBe("test y");
    });

    it("emits close", async () => {
        const wrapper = getWrapper();
        await wrapper.find("button#cancel-download-img").trigger("click");
        expect(wrapper.emitted("close")!.length).toBe(1);
    });

    it("emits confirm with edited values", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-img-title").setValue("new title");
        await wrapper.find("#download-img-x-label").setValue("new x");
        await wrapper.find("#download-img-y-label").setValue("new y");
        await wrapper.find("#confirm-download-img").trigger("click");
        expect(wrapper.emitted("confirm")).toStrictEqual([["new title", "new x", "new y"]]);
    });
});
