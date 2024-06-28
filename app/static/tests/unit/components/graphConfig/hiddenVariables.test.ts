import Vuex from "vuex";
import {BasicState} from "../../../../src/app/store/basic/state";
import {GraphsAction} from "../../../../src/app/store/graphs/actions";
import {shallowMount} from "@vue/test-utils";
import HiddenVariables from "../../../../src/app/components/graphConfig/HiddenVariables.vue";
import {GraphsGetter} from "../../../../src/app/store/graphs/getters";

describe("HiddenVariables", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockUpdateSelectedVariables = jest.fn();

    const getWrapper = () => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                graphs: {
                    namespaced: true,
                    state: {
                        config: [
                            {
                                selectedVariables: ["S"]
                            }
                        ]
                    },
                    actions: {
                        [GraphsAction.UpdateSelectedVariables]: mockUpdateSelectedVariables
                    },
                    getters: {
                        [GraphsGetter.hiddenVariables]: ["I", "R"]
                    } as any
                },
                model: {
                    namespaced: true,
                    state: {
                        paletteModel: {
                            S: "#ff0000",
                            I: "#00ff00",
                            R: "#0000ff"
                        }
                    }
                }
            }
        });

        return shallowMount(HiddenVariables, {
            props: {
                dragging: false
            },
            global: {
                plugins: [store]
            }
        });
    };


    it("renders as expected", () => {
        const wrapper = getWrapper();
    });

    /*
    it("starting drag sets values in event and emits setDragging");

    it("ending drag emits setDragging");

    it("onDrop removes variable from source");

    it("shows drop zone when dragging", () => {
        const wrapper = getWrapper({dragging: true});
        expect(wrapper.find(".drop-zone").classes()).toStrictEqual(["drop-zone", "drop-zone-active"]);
    });

    it("shows instruction if no hidden variables", () =>{
        const wrapper = getWrapper({}, []);
        expect(wrapper.find(".drop-zone-instruction").text()).toBe("Drag variables here to select them for this graph.");
    });*/
});