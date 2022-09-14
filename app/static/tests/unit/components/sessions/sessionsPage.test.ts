import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import SessionsPage from "../../../../src/app/components/sessions/SessionsPage.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import { SessionsAction } from "../../../../src/app/store/sessions/actions";
import { SessionMetadata } from "../../../../src/app/types/responseTypes";

describe("SessionsPage", () => {
    const mockGetSessions = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = (sessionsMetadata: SessionMetadata[] | null) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ appName: "testApp" }),
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
        expect(session1Cells.at(0)!.text()).toBe("13/01/2022 09:26:36");
        expect(session1Cells.at(1)!.text()).toBe("session1");
        expect(session1Cells.at(2)!.find("a").attributes("href")).toBe("/apps/testApp?sessionId=abc");
        expect(session1Cells.at(2)!.find("a").findComponent(VueFeather).props("type")).toBe("upload");
        const session2Cells = rows.at(3)!.findAll("div.session-col-value");
        expect(session2Cells.at(0)!.text()).toBe("13/01/2022 10:26:36");
        expect(session2Cells.at(1)!.text()).toBe("--no label--");
        expect(session2Cells.at(2)!.find("a").attributes("href")).toBe("/apps/testApp?sessionId=def");
        expect(session2Cells.at(2)!.find("a").findComponent(VueFeather).props("type")).toBe("upload");
    });

    it("does not render session rows when no session metadata in store", () => {
        const wrapper = getWrapper(null);
        const rows = wrapper.findAll(".container .row");
        expect(rows.length).toBe(1);
        expect(rows.at(0)!.text()).toBe("Sessions");
    });

    it("dispatches getSessions action on mount", () => {
        getWrapper(null);
        expect(mockGetSessions).toHaveBeenCalledTimes(1);
    });
});
