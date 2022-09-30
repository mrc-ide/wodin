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

describe("SessionsPage", () => {
    const mockGetSessions = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = (sessionsMetadata: SessionMetadata[] | null) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ appName: "testApp", sessionId: "abc" }),
            modules: {
                sessions: {
                    namespaced: true,
                    state: {
                        sessionsMetadata
                    },
                    actions: {
                        [SessionsAction.GetSessions]: mockGetSessions
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

    it("renders as expected", () => {
        const sessionsMetadata = [
            { id: "abc", time: "2022-01-13T09:26:36.396Z", label: "session1" },
            { id: "def", time: "2022-01-13T10:26:36.396Z", label: null }
        ];
        const wrapper = getWrapper(sessionsMetadata);
        const rows = wrapper.findAll(".container .row");
        expect(rows.at(0)!.find("h2").text()).toBe("Sessions");
        const columnHeaders = rows.at(1)!.findAll("div.session-col-header");
        expect(columnHeaders.at(0)!.text()).toBe("Saved");
        expect(columnHeaders.at(1)!.text()).toBe("Label");
        expect(columnHeaders.at(2)!.text()).toBe("Load");
        const session1Cells = rows.at(2)!.findAll("div.session-col-value");
        expect(session1Cells.at(0)!.text()).toBe("13/01/2022 09:26:36 (current session)");
        expect(session1Cells.at(1)!.text()).toBe("session1");
        const routerLink = session1Cells.at(2)!.findComponent(RouterLink);
        expect(routerLink.props("to")).toBe("/");
        const session2Cells = rows.at(3)!.findAll("div.session-col-value");
        expect(session2Cells.at(0)!.text()).toBe("13/01/2022 10:26:36");
        expect(session2Cells.at(1)!.text()).toBe("--no label--");
        expect(session2Cells.at(2)!.find("a").attributes("href")).toBe("/apps/testApp?sessionId=def");
        expect(session2Cells.at(2)!.find("a").findComponent(VueFeather).props("type")).toBe("upload");
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
});
