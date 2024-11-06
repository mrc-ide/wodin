import { shallowMount } from "@vue/test-utils";
import WodinTabs from "../../../src/components/WodinTabs.vue";

describe("WodinTabs", () => {
    const getWrapper = () => {
        return shallowMount(WodinTabs, {
            props: {
                tabNames: ["one", "two"]
            },
            slots: {
                one: "<div>ONE</div>",
                two: "<div>TWO</div>"
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const listItems = wrapper.findAll("ul.nav-tabs li");

        expect(listItems.length).toBe(2);
        const item1 = listItems.at(0)!;
        expect(item1.text()).toBe("one");
        expect(item1.find("a").classes()).toStrictEqual(["nav-link", "active"]);
        const item2 = listItems.at(1)!;
        expect(item2.text()).toBe("two");
        expect(item2.find("a").classes()).toStrictEqual(["nav-link"]);

        const slotContainer = wrapper.find("div");
        expect(slotContainer.html()).toContain("<div>ONE</div>");
        expect(slotContainer.html()).not.toContain("<div>TWO</div>");
    });

    it("clicking tab makes it active and shows its content, and emits tabSelected", async () => {
        const wrapper = getWrapper();
        const tabLinks = wrapper.findAll("ul.nav-tabs li a");

        await tabLinks.at(1)!.trigger("click");
        expect(tabLinks.at(0)!.classes()).toStrictEqual(["nav-link"]);
        expect(tabLinks.at(1)!.classes()).toStrictEqual(["nav-link", "active"]);
        const slotContainer = wrapper.find("div");
        expect(slotContainer.html()).toContain("<div>TWO</div>");
        expect(slotContainer.html()).not.toContain("<div>ONE</div>");
        expect(wrapper.emitted("tabSelected")!.length).toBe(1);
        expect(wrapper.emitted("tabSelected")![0]).toStrictEqual(["two"]);

        // can click back too
        await tabLinks.at(0)!.trigger("click");
        expect(tabLinks.at(0)!.classes()).toContain("active");
        expect(slotContainer.html())!.toContain("<div>ONE</div>");
        expect(wrapper.emitted("tabSelected")!.length).toBe(2);
        expect(wrapper.emitted("tabSelected")![1]).toStrictEqual(["one"]);
    });
});
