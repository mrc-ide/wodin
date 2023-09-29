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
import ConfirmModal from "../../../../src/app/components/ConfirmModal.vue";

describe("SessionsPage", () => {
    const mockGetSessions = jest.fn();
    const mockGenerateFriendlyId = jest.fn();
    const mockClipboardWriteText = jest.fn();
    const mockDeleteSession = jest.fn();

    Object.assign(window.navigator, {
        clipboard: {
            writeText: mockClipboardWriteText
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const currentSessionId = "abc";

    const getWrapper = (sessionsMetadata: SessionMetadata[] | null, sessionId: string | undefined) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                appName: "testApp",
                sessionId,
                baseUrl: "http://localhost:3000",
                appsPath: "apps"
            }),
            modules: {
                sessions: {
                    namespaced: true,
                    state: {
                        sessionsMetadata
                    },
                    actions: {
                        [SessionsAction.GetSessions]: mockGetSessions,
                        [SessionsAction.GenerateFriendlyId]: mockGenerateFriendlyId,
                        [SessionsAction.DeleteSession]: mockDeleteSession
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
        },
        {
            id: "ghi", time: "2022-01-14T10:26:36.396Z", label: "another session", friendlyId: "good-dog"
        }
    ];

    it("renders as expected", () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        const rows = wrapper.findAll(".container .row");
        expect(rows.at(0)!.find("h2").text()).toBe("Sessions");

        const currentSessionRow = rows.at(1)!;
        expect(currentSessionRow.findComponent(RouterLink).props("to")).toBe("/");
        expect(currentSessionRow.find("a").text()).toBe("make a copy of the current session.");
        expect(currentSessionRow.find("a").attributes("href")).toBe("http://localhost:3000/apps/testApp/?sessionId=abc");
        expect(currentSessionRow.find(".session-copy-link").text()).toBe("Copy link for current session");
        expect(currentSessionRow.find(".session-copy-code").text()).toBe("Copy code for current session");

        const columnHeaders = rows.at(2)!.findAll("div.session-col-header");
        expect(columnHeaders.length).toBe(6);
        expect(columnHeaders.at(0)!.text()).toBe("Saved");
        expect(columnHeaders.at(1)!.text()).toBe("Label");
        expect(columnHeaders.at(2)!.text()).toBe("Edit Label");
        expect(columnHeaders.at(3)!.text()).toBe("Load");
        expect(columnHeaders.at(4)!.text()).toBe("Delete");
        expect(columnHeaders.at(5)!.text()).toBe("Shareable Link");

        const session2Cells = rows.at(3)!.findAll("div.session-col-value");
        expect(session2Cells.length).toBe(6);
        expect(session2Cells.at(0)!.text()).toBe("13/01/2022 10:26:36");
        expect(session2Cells.at(1)!.text()).toBe("--no label--");
        expect(session2Cells.at(2)!.findComponent(VueFeather).props("type")).toBe("edit-2");
        expect(session2Cells.at(3)!.find("a").attributes("href"))
            .toBe("http://localhost:3000/apps/testApp/?sessionId=def");
        expect(session2Cells.at(3)!.find("a").findComponent(VueFeather).props("type")).toBe("upload");
        expect(session2Cells.at(4)!.findComponent(VueFeather).props("type")).toBe("trash-2");
        expect(session2Cells.at(5)!.find("span.session-copy-link").text()).toBe("Copy link");
        expect(session2Cells.at(5)!.find("span.session-copy-code").text()).toBe("Copy code");
        expect(session2Cells.at(5)!.find(".session-copy-confirm").text()).toBe("");

        const editDlg = wrapper.findComponent(EditSessionLabel);
        expect(editDlg.props("open")).toBe(false);
        expect(editDlg.props("sessionId")).toBe(null);
        expect(editDlg.props("sessionLabel")).toBe(null);

        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
        expect(wrapper.findComponent(ConfirmModal).props("open")).toBe(false);
        expect(wrapper.findComponent(ConfirmModal).props("title")).toBe("Delete session");
        expect(wrapper.findComponent(ConfirmModal).props("text")).toBe("Do you want to delete this session?");
    });

    it("shows loading message when session metadata is null in store", () => {
        const wrapper = getWrapper(null, currentSessionId);
        const rows = wrapper.findAll(".container .row");
        expect(rows.length).toBe(2);
        expect(rows.at(0)!.text()).toBe("Sessions");
        expect(wrapper.find("#loading-sessions").text()).toBe("Loading sessions...");
    });

    it("renders as expected when no current session", () => {
        const wrapper = getWrapper(sessionsMetadata, undefined);

        expect(wrapper.find("#current-session").exists()).toBe(false);
        const noCurrent = wrapper.find("#no-current-session");
        expect(noCurrent.exists()).toBe(true);
        expect(noCurrent.findComponent(RouterLink).props("to")).toBe("/");
        expect(noCurrent.find("#load-previous-span").text()).toBe("or load a previous session.");

        expect(wrapper.find("#previous-sessions-headers").exists()).toBe(true);
        expect(wrapper.findAll(".previous-session-row").length).toBe(3);
    });

    it("renders as expected when no previous sessions", () => {
        // include current session in metadata only
        const wrapper = getWrapper([sessionsMetadata[0]], currentSessionId);
        expect(wrapper.find("#no-current-session").exists()).toBe(false);
        const current = wrapper.find("#current-session");
        expect(current.exists()).toBe(true);
        expect(current.findComponent(RouterLink).props("to")).toBe("/");
        expect(current.find("a").text()).toBe("make a copy of the current session.");

        expect(wrapper.find("#previous-sessions-headers").exists()).toBe(false);
        expect(wrapper.findAll(".previous-session-row").length).toBe(0);
    });

    it("renders as expected when no current session and no previous sessions", () => {
        const wrapper = getWrapper([], undefined);
        expect(wrapper.find("#current-session").exists()).toBe(false);
        const noCurrent = wrapper.find("#no-current-session");
        expect(noCurrent.exists()).toBe(true);
        expect(noCurrent.findComponent(RouterLink).props("to")).toBe("/");
        expect(noCurrent.find("#load-previous-span").exists()).toBe(false);

        expect(wrapper.find("#previous-sessions-headers").exists()).toBe(false);
        expect(wrapper.findAll(".previous-session-row").length).toBe(0);
    });

    it("dispatches getSessions action on mount", () => {
        getWrapper(null, currentSessionId);
        expect(mockGetSessions).toHaveBeenCalledTimes(1);
    });

    it("shows edit label dialog when click icon", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        const rows = wrapper.findAll(".previous-session-row");
        const session1Cells = rows.at(1)!.findAll("div.session-col-value");
        await session1Cells.at(2)!.findComponent(VueFeather).trigger("click");
        const editDlg = wrapper.findComponent(EditSessionLabel);
        expect(editDlg.props("open")).toBe(true);
        expect(editDlg.props("sessionId")).toBe("ghi");
        expect(editDlg.props("sessionLabel")).toBe("another session");
    });

    it("copy link dispatches GenerateFriendlyId only if session has no friendly id", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        // session 1 already has a friendly id so action should not be dispatched
        await wrapper.find("#current-session .session-copy-link").trigger("click");
        expect(mockGenerateFriendlyId).not.toHaveBeenCalled();
        // session 2 has no friendly id so action should be dispatched
        const session2Cells = wrapper.find(".previous-session-row").findAll("div.session-col-value");
        await session2Cells.at(5)!.find(".session-copy-link").trigger("click");
        expect(mockGenerateFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockGenerateFriendlyId.mock.calls[0][1]).toBe("def");
    });

    it("copy code dispatches GenerateFriendlyId only if session has no friendly id", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        // session 1 already has a friendly id so action should not be dispatched
        await wrapper.find("#current-session .session-copy-code").trigger("click");
        expect(mockGenerateFriendlyId).not.toHaveBeenCalled();
        // session 2 has no friendly id so action should be dispatched
        const session2Cells = wrapper.find(".previous-session-row").findAll("div.session-col-value");
        await session2Cells.at(5)!.find(".session-copy-code").trigger("click");
        expect(mockGenerateFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockGenerateFriendlyId.mock.calls[0][1]).toBe("def");
    });

    it("copy link copies link to clipboard and updates confirmation", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);

        // current session
        await wrapper.find("#current-session .session-copy-link").trigger("click");
        let expectedLink = "http://localhost:3000/apps/testApp/?share=bad-cat";
        expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);
        expect(mockClipboardWriteText.mock.calls[0][0]).toBe(expectedLink);
        expect(wrapper.find("#current-session .session-copy-confirm").text()).toBe(`Copied: ${expectedLink}`);

        // previous session
        const session3Row = wrapper.findAll(".previous-session-row").at(1)!;
        await session3Row.find(".session-copy-link").trigger("click");
        expectedLink = "http://localhost:3000/apps/testApp/?share=good-dog";
        expect(mockClipboardWriteText).toHaveBeenCalledTimes(2);
        expect(mockClipboardWriteText.mock.calls[1][0]).toBe(expectedLink);
        expect(session3Row.find(".session-copy-confirm").text()).toBe(`Copied: ${expectedLink}`);
    });

    it("copy code copies friendly id to clipboard and updates confirmation", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);

        // current session
        await wrapper.find("#current-session .session-copy-code").trigger("click");
        expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);
        expect(mockClipboardWriteText.mock.calls[0][0]).toBe("bad-cat");
        expect(wrapper.find("#current-session .session-copy-confirm").text()).toBe("Copied: bad-cat");

        // previous session
        const session3Row = wrapper.findAll(".previous-session-row").at(1)!;
        await session3Row.find(".session-copy-code").trigger("click");
        expect(mockClipboardWriteText).toHaveBeenCalledTimes(2);
        expect(mockClipboardWriteText.mock.calls[1][0]).toBe("good-dog");
        expect(session3Row.find(".session-copy-confirm").text()).toBe("Copied: good-dog");
    });

    it("mouseleave event from copy control in previous session row clears confirm text", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        const rows = wrapper.findAll(".previous-session-row");
        const session3Cells = rows.at(1)!.findAll("div.session-col-value");
        await session3Cells.at(5)!.find(".session-copy-code").trigger("click");
        expect(session3Cells.at(5)!.find(".session-copy-confirm").text()).toBe("Copied: good-dog");

        await session3Cells.at(5)!.find(".session-copy-code").trigger("mouseleave");
        expect(session3Cells.at(5)!.find(".session-copy-confirm").text()).toBe("");
    });

    it("mouseleave event from copy control for current session clears confirm text", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        await wrapper.find("#current-session .session-copy-code").trigger("click");
        expect(wrapper.find("#current-session .session-copy-confirm").text()).toBe("Copied: bad-cat");

        await wrapper.find("#current-session .session-copy-code").trigger("mouseleave");
        expect(wrapper.find("#current-session .session-copy-confirm").text()).toBe("");
    });

    it("copy confirmation indicates if friendly id is being fetched, and could not be generated", (done) => {
        const runAsync = async () => {
            // the mock generate action won't mutate the state, so friendly id will still be null after it's done,
            // and the component will assume the id could not be fetched
            const wrapper = getWrapper(sessionsMetadata, currentSessionId);
            const rows = wrapper.findAll(".previous-session-row");
            const session2Cells = rows.at(0)!.findAll("div.session-col-value");
            await session2Cells.at(5)!.find(".session-copy-code").trigger("click");
            // message will update to 'Fetching code...' while it calls the action
            const confirm = session2Cells.at(5)!.find(".session-copy-confirm");
            expect(confirm.text()).toBe("Fetching code...");

            // when action is completed, id has not been successfully updated
            setTimeout(() => {
                expect(confirm.text()).toBe("Error fetching code");
                done();
            });
        };
        runAsync();
    });

    it("opens and closes confirm delete dialog", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        const rows = wrapper.findAll(".container .row");
        const session1Cells = rows.at(3)!.findAll("div.session-col-value");
        await session1Cells.at(4)!.findComponent(VueFeather).trigger("click");
        const confirm = wrapper.findComponent(ConfirmModal);
        expect(confirm.props("open")).toBe(true);
        await confirm.vm.$emit("close");
        expect(confirm.props("open")).toBe(false);
    });

    it("deletes session on confirm", async () => {
        const wrapper = getWrapper(sessionsMetadata, currentSessionId);
        const rows = wrapper.findAll(".container .row");
        const session1Cells = rows.at(3)!.findAll("div.session-col-value");
        await session1Cells.at(4)!.findComponent(VueFeather).trigger("click"); // set session to delete
        const confirm = wrapper.findComponent(ConfirmModal);
        await confirm.vm.$emit("confirm");
        expect(mockDeleteSession).toHaveBeenCalledTimes(1);
        expect(mockDeleteSession.mock.calls[0][1]).toBe("def");
    });
});
