import { shallowMount } from "@vue/test-utils";
import DataTab from "../../../../src/app/components/data/DataTab.vue";

describe("Data Tab", () => {
    it("renders as expected", () => {
        const wrapper = shallowMount(DataTab);
        expect(wrapper.text()).toBe("Coming soon: Data upload");
    });
});
