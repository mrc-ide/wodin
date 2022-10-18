import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { mockBasicState, mockRunState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import DownloadOutput from "../../../src/app/components/DownloadOutput.vue";
import { RunMutation } from "../../../src/app/store/run/mutations";
import { RunAction } from "../../../src/app/store/run/actions";

// eslint-disable-next-line max-len
const generatedFilenameRegex = /^test-run-([0-9]{4})?(1[0-2]|0[1-9])?(3[01]|0[1-9]|[12][0-9])-(2[0-3]|[0-1][0-9])?([0-5][0-9])?([0-5][0-9])?$/;
// eslint-disable-next-line max-len
const generatedFilenameWithSuffixRegex = /^test-run-([0-9]{4})?(1[0-2]|0[1-9])?(3[01]|0[1-9]|[12][0-9])-(2[0-3]|[0-1][0-9])?([0-5][0-9])?([0-5][0-9])?.xlsx$/;

describe("DownloadOutput", () => {
    const mockSetUserOownloadFileName = jest.fn();
    const mockDownloadOutput = jest.fn();

    const getWrapper = (userDownloadFileName = "") => {
        const state = mockBasicState({ appName: "test" });
        const store = new Vuex.Store<BasicState>({
            state,
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        userDownloadFileName
                    }),
                    mutations: {
                        [RunMutation.SetUserDownloadFileName]: mockSetUserOownloadFileName
                    },
                    actions: {
                        [RunAction.DownloadOutput]: mockDownloadOutput
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props: {
                open: false
            }
        };

        return shallowMount(DownloadOutput, options);
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("renders as expected when not open", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".modal-backdrop").exists()).toBe(false);
        expect(wrapper.find(".modal").classes()).not.toContain("show");
        expect((wrapper.find(".modal").element as HTMLElement).style.display).toBe("none");
    });

    it("renders as expected with  user provided download file name", async () => {
        const wrapper = getWrapper("myFile.xlsx");
        await wrapper.setProps({ open: true });

        expect(wrapper.find(".modal-backdrop").exists()).toBe(true);
        expect(wrapper.find(".modal").classes()).toContain("show");
        expect((wrapper.find(".modal").element as HTMLElement).style.display).toBe("block");
        expect(wrapper.find("h5.modal-title").text()).toBe("Download Run");
        const rows = wrapper.findAll(".modal-body .row");
        expect(rows.length).toBe(3);
        expect(rows.at(0)!.find("label").text()).toBe("File name");
        expect((rows.at(0)!.find("input").element as HTMLInputElement).value).toBe("myFile.xlsx");

        expect(rows.at(1)!.find("label").text()).toBe("Modelled points");
        expect((rows.at(1)!.find("input").element as HTMLInputElement).value).toBe("501");

        expect(wrapper.find("#download-invalid").text()).toBe("");

        expect(wrapper.find(".modal-footer button#ok-download").text()).toBe("OK");
        expect((wrapper.find(".modal-footer button#ok-download").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.find(".modal-footer button#cancel-download").text()).toBe("Cancel");
    });

    it("renders generated default file name as expected", async () => {
        const wrapper = getWrapper();
        await wrapper.setProps({ open: true });
        const rows = wrapper.findAll(".modal-body .row");
        const generatedFilename = (rows.at(0)!.find("input").element as HTMLInputElement).value;
        expect(generatedFilename).toMatch(generatedFilenameRegex);
    });

    it("emits close event on click Cancel", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#cancel-download").trigger("click");
        expect(wrapper.emitted().close.length).toBe(1);
    });

    it("commits user download file name on input value change", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-file-name input").setValue("myFile.xlsx");
        expect(mockSetUserOownloadFileName).toHaveBeenCalledTimes(1);
        expect(mockSetUserOownloadFileName.mock.calls[0][1]).toBe("myFile.xlsx");
    });

    it("dispatches download and emits close event on click OK", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-file-name input").setValue("myFile");
        await wrapper.find("#download-points input").setValue("1001");
        await wrapper.find("#ok-download").trigger("click");
        expect(mockDownloadOutput).toHaveBeenCalledTimes(1);
        expect(mockDownloadOutput.mock.calls[0][1]).toStrictEqual({
            fileName: "myFile.xlsx",
            points: 1001
        });
        expect(wrapper.emitted().close.length).toBe(1);
    });

    it("generates new filename on ok click if text box has been cleared", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-file-name input").setValue("");
        await wrapper.find("#ok-download").trigger("click");
        const payload = mockDownloadOutput.mock.calls[0][1];
        expect(payload.fileName).toMatch(generatedFilenameWithSuffixRegex);
        expect(payload.points).toBe(501);
    });

    it("does not allow download if modelled points is less than 1", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-points input").setValue("0");
        expect((wrapper.find(".modal-footer button#ok-download").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.find("#download-invalid").text()).toBe("Modelled points must be between 1 and 50,001");
    });

    it("does not allow download if modelled points is greater than 500001", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-points input").setValue("50002");
        expect((wrapper.find(".modal-footer button#ok-download").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.find("#download-invalid").text()).toBe("Modelled points must be between 1 and 50,001");
    });
});
