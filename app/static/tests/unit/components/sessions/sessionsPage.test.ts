import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import { RouterLink } from "vue-router";
import SessionsPage from "../../../../src/app/components/sessions/SessionsPage.vue";
import ErrorsAlert from "../../../../src/app/components/ErrorsAlert.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import { SessionsAction } from "../../../../src/app/store/sessions/actions";
import { SessionMetadata } from "../../../../src/app/types/responseTypes";
import EditSessionLabel from "../../../../src/app/components/sessions/EditSessionLabel.vue";

describe("SessionsPage", () => {
    const mockGetSessions = jest.fn();
    const mockGenerateFriendlyId = jest.fn();
    const mockClipboardWriteText = jest.fn();

    Object.assign(window.navigator, {
        clipboard: {
            writeText: mockClipboardWriteText
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = (sessionsMetadata: SessionMetadata[] | null) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                appName: "testApp",
                sessionId: "abc",
                config: {
                    baseUrl: "http://localhost:3000"
                } as any
            }),
            modules: {
                sessions: {
                    namespaced: true,
                    state: {
                        sessionsMetadata
                    },
                    actions: {
                        [SessionsAction.GetSessions]: mockGetSessions,
                        [SessionsAction.GenerateFriendlyId]: mockGenerateFriendlyId
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            }
        };

        return shallowMount(SessionsPage, options);
    };

    const sessionsMetadata = [
        {
            id: "abc", time: "2022-01-13T09:26:36.396Z", label: "session1", friendlyId: "bad-cat"
        },
        {
            id: "def", time: "2022-01-13T10:26:36.396Z", label: null, friendlyId: null
        }
    ];

    it("renders as expected", () => {
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        expect(rows.at(0)!.find("h2").text()).toBe("Sessions");
        const columnHeaders = rows.at(1)!.findAll("div.session-col-header");
        expect(columnHeaders.length).toBe(5);
        expect(columnHeaders.at(0)!.text()).toBe("Saved");
        expect(columnHeaders.at(1)!.text()).toBe("Label");
        expect(columnHeaders.at(2)!.text()).toBe("Edit Label");
        expect(columnHeaders.at(3)!.text()).toBe("Load");
        expect(columnHeaders.at(4)!.text()).toBe("Share");
        const session1Cells = rows.at(2)!.findAll("div.session-col-value");
        expect(session1Cells.length).toBe(5);
        expect(session1Cells.at(0)!.text()).toBe("13/01/2022 09:26:36 (current session)");
        expect(session1Cells.at(1)!.text()).toBe("session1");
        expect(session1Cells.at(2)!.findComponent(VueFeather).props("type")).toBe("edit-2");
        const routerLink = session1Cells.at(3)!.findComponent(RouterLink);
        expect(routerLink.props("to")).toBe("/");
        expect(session1Cells.at(4)!.find("span.session-copy-link").text()).toBe("Copy link");
        expect(session1Cells.at(4)!.find("span.session-copy-link").findComponent(VueFeather).props("type"))
            .toBe("copy");
        expect(session1Cells.at(4)!.find("span.session-copy-code").text()).toBe("Copy code");
        expect(session1Cells.at(4)!.find("span.session-copy-code").findComponent(VueFeather).props("type"))
            .toBe("copy");
        expect(session1Cells.at(4)!.find("span.session-copy-confirm").text()).toBe("");
        const session2Cells = rows.at(3)!.findAll("div.session-col-value");
        expect(session1Cells.length).toBe(5);
        expect(session2Cells.at(0)!.text()).toBe("13/01/2022 10:26:36");
        expect(session2Cells.at(1)!.text()).toBe("--no label--");
        expect(session2Cells.at(2)!.findComponent(VueFeather).props("type")).toBe("edit-2");
        expect(session2Cells.at(3)!.find("a").attributes("href")).toBe("/apps/testApp?sessionId=def");
        expect(session2Cells.at(3)!.find("a").findComponent(VueFeather).props("type")).toBe("upload");
        expect(session2Cells.at(4)!.find("span.session-copy-link").text()).toBe("Copy link");
        expect(session2Cells.at(4)!.find("span.session-copy-code").text()).toBe("Copy code");
        expect(session2Cells.at(4)!.find("span.session-copy-confirm").text()).toBe("");

        const editDlg = wrapper.findComponent(EditSessionLabel);
        expect(editDlg.props("open")).toBe(false);
        expect(editDlg.props("sessionId")).toBe(null);
        expect(editDlg.props("sessionLabel")).toBe(null);

        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("shows loading message when session metadata is null in store", () => {
        const wrapper = getWrapper(null);
        const rows = wrapper.findAll(".container .row");
        expect(rows.length).toBe(1);
        expect(rows.at(0)!.text()).toBe("Sessions");
        expect(wrapper.find("#loading-sessions").text()).toBe("Loading sessions...");
    });

    it("shows no sessions yet message when session metadata is empty in store", () => {
        const wrapper = getWrapper([]);
        const rows = wrapper.findAll(".container .row");
        expect(rows.length).toBe(1);
        expect(rows.at(0)!.text()).toBe("Sessions");
        expect(wrapper.find("#empty-sessions").text()).toContain("No saved sessions yet.");
        expect(wrapper.find("#empty-sessions").findComponent(RouterLink).props("to")).toBe("/");
    });

    it("dispatches getSessions action on mount", () => {
        getWrapper(null);
        expect(mockGetSessions).toHaveBeenCalledTimes(1);
    });

    it("shows edit label dialog when click icon", async () => {
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        const session2Cells = rows.at(3)!.findAll("div.session-col-value");
        await session2Cells.at(2)!.findComponent(VueFeather).trigger("click");
        const editDlg = wrapper.findComponent(EditSessionLabel);
        expect(editDlg.props("open")).toBe(true);
        expect(editDlg.props("sessionId")).toBe("def");
        expect(editDlg.props("sessionLabel")).toBe("session2");
    });

    it("copy link dispatches GenerateFriendlyId only if session has no friendly id", async () => {
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        // session 1 already has a friendly id so action should not be dispatched
        const session1Cells = rows.at(2)!.findAll("div.session-col-value");
        await session1Cells.at(4)!.find(".session-copy-link").trigger("click");
        expect(mockGenerateFriendlyId).not.toHaveBeenCalled();
        // session 2 has no friendly id so action should be dispatched
        const session2Cells = rows.at(3)!.findAll("div.session-col-value");
        await session2Cells.at(4)!.find(".session-copy-link").trigger("click");
        expect(mockGenerateFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockGenerateFriendlyId.mock.calls[0][1]).toBe("def");
    });

    it("copy code dispatches GenerateFriendlyId only if session has no friendly id", async () => {
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        // session 1 already has a friendly id so action should not be dispatched
        const session1Cells = rows.at(2)!.findAll("div.session-col-value");
        await session1Cells.at(4)!.find(".session-copy-code").trigger("click");
        expect(mockGenerateFriendlyId).not.toHaveBeenCalled();
        // session 2 has no friendly id so action should be dispatched
        const session2Cells = rows.at(3)!.findAll("div.session-col-value");
        await session2Cells.at(4)!.find(".session-copy-code").trigger("click");
        expect(mockGenerateFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockGenerateFriendlyId.mock.calls[0][1]).toBe("def");
    });

    it("copy link copies link to clipboard and updates confirmation", async () => {
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        const session1Cells = rows.at(2)!.findAll("div.session-col-value");
        await session1Cells.at(4)!.find(".session-copy-link").trigger("click");

        const expectedLink = "http://localhost:3000/apps/testApp/?share=bad-cat";

        expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);
        expect(mockClipboardWriteText.mock.calls[0][0]).toBe(expectedLink);

        expect(session1Cells.at(4)!.find(".session-copy-confirm").text())
            .toBe(`Copied: ${expectedLink}`);
    });

    it("copy code copies friendly id to clipboard and updates confirmation", async () => {
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        const session1Cells = rows.at(2)!.findAll("div.session-col-value");
        await session1Cells.at(4)!.find(".session-copy-code").trigger("click");

        expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);
        expect(mockClipboardWriteText.mock.calls[0][0]).toBe("bad-cat");

        expect(session1Cells.at(4)!.find(".session-copy-confirm").text())
            .toBe("Copied: bad-cat");
    });

    it("mouseleave event from copy control clears confirm text", async () => {
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        const session1Cells = rows.at(2)!.findAll("div.session-col-value");
        await session1Cells.at(4)!.find(".session-copy-code").trigger("click");
        expect(session1Cells.at(4)!.find(".session-copy-confirm").text()).toBe("Copied: bad-cat");

        await session1Cells.at(4)!.find(".session-copy-code").trigger("mouseleave");
        expect(session1Cells.at(4)!.find(".session-copy-confirm").text()).toBe("");
    });

    it("copy confirmation indicates if friendly id is being fetched, and could not be generated", (done) => {
        const runAsync = async () => {
            // the mock generate action won't mutate the state, so friendly id will still be null after it's done,
            // and the component will assume the id could not be fetched
            const wrapper = getWrapper(sessionsMetadata);
            const rows = wrapper.findAll(".container .row");
            const session2Cells = rows.at(3)!.findAll("div.session-col-value");
            await session2Cells.at(4)!.find(".session-copy-code").trigger("click");
            // message will update to 'Fetching code...' while it calls the action
            const confirm = session2Cells.at(4)!.find(".session-copy-confirm");
            expect(confirm.text()).toBe("Fetching code...");

            // when action is completed, id has not been successfully updated
            setTimeout(() => {
                expect(confirm.text()).toBe("Error fetching code");
                done();
            });
        };
        runAsync();
    });
});
