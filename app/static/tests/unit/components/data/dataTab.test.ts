import { shallowMount } from "@vue/test-utils";
import DataTab from "../../../../src/app/components/data/DataTab.vue";

describe("Data Tab", () => {
    const getWrapper = () => {};

    it("renders as expected", () => {
        const wrapper = shallowMount(DataTab);
        expect(wrapper.find("h3").text()).toBe("Upload data");
        expect(wrapper.find("input").attributes("type")).toBe("file");
        expect(wrapper.find("input").attributes("accept")).toBe(".csv,.txt");
    });
});
