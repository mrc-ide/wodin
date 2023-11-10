import { mount } from "@vue/test-utils";
import ConfirmModal from "../../../src/app/components/ConfirmModal.vue";

describe("ConfirmModal", () => {
  const getWrapper = (open = true, title = "Delete something", text = "Really?") => {
    return mount(ConfirmModal, { props: { title, text, open } });
  };

  it("renders as expected", () => {
    const wrapper = getWrapper();
    expect(wrapper.find(".modal-title").text()).toBe("Delete something");
    expect(wrapper.find(".modal-body").text()).toBe("Really?");
    expect(wrapper.find("button#confirm-yes").text()).toBe("Yes");
    expect(wrapper.find("button#confirm-no").text()).toBe("No");
    expect((wrapper.find("div.modal").element as HTMLDivElement).style.display).toBe("block");
  });

  it("hides modal when not open", () => {
    const wrapper = getWrapper(false);
    expect((wrapper.find("div.modal").element as HTMLDivElement).style.display).toBe("none");
  });

  it("No button emits close", async () => {
    const wrapper = getWrapper();
    await wrapper.find("button#confirm-no").trigger("click");
    expect(wrapper.emitted("close")!.length).toBe(1);
    expect(wrapper.emitted("confirm")).toBe(undefined);
  });

  it("Yes button emits close and confirm", async () => {
    const wrapper = getWrapper();
    await wrapper.find("button#confirm-yes").trigger("click");
    expect(wrapper.emitted("close")!.length).toBe(1);
    expect(wrapper.emitted("confirm")!.length).toBe(1);
  });
});
