import Vuex from "vuex";
import { ModelState } from "../../../../src/app/store/model/state";
import baseSensitivity from "../../../../src/app/components/mixins/baseSensitivity";
import { BaseSensitivityState } from "../../../../src/app/store/sensitivity/state";
import { noSensitivityUpdateRequired } from "../../../../src/app/store/sensitivity/sensitivity";
import {AppState} from "../../../../src/app/store/appState/state";

describe("baseSensitivity mixin", () => {
    const getStore = (hasRunner = true, modelState: Partial<ModelState> = {}, sensitivityState: Partial<BaseSensitivityState> = {},
        multiSensitivityState: Partial<BaseSensitivityState> = {}) => {
        return new Vuex.Store<AppState>({
            state: {} as any,
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        odin: {},
                        compileRequired: false,
                        selectedVariables: ["A"],
                        ...modelState
                    },
                    getters: {
                        hasRunner: () => hasRunner
                    }
                },
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        sensitivityUpdateRequired: noSensitivityUpdateRequired(),
                        result: {
                            batch: {
                                solutions: [{}]
                            }
                        },
                        ...multiSensitivityState
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        sensitivityUpdateRequired: noSensitivityUpdateRequired(),
                        result: {
                            batch: {
                                solutions: [{}]
                            }
                        },
                        ...sensitivityState
                    }
                }
            } as any
        });
    };

    it("sensitivityPrerequisitesReady returns true when all prerequisites have been met", () => {
        const store = getStore();
        const sut = baseSensitivity(store, false);
        expect(sut.sensitivityPrerequisitesReady.value).toBe(true);
    });

    it("sensitivityPrerequisitesReady returns false when hasRunner is false", () => {
        const store = getStore(false);
        const sut = baseSensitivity(store, false);
        expect(sut.sensitivityPrerequisitesReady.value).toBe(false);
    });

    it("sensitivityPrerequisitesReady returns false when odin is not present", () => {
        const store = getStore(true, { odin: null });
        const sut = baseSensitivity(store, false);
        expect(sut.sensitivityPrerequisitesReady.value).toBe(false);
    });

    it("sensitivityPrerequisitesReady returns false when compileRequired is true", () => {
        const store = getStore(true, { compileRequired: true });
        const sut = baseSensitivity(store, false);
        expect(sut.sensitivityPrerequisitesReady.value).toBe(false);
    });

    const expectUpdateMsgForSensAndMultiSens = (hasRunner: true, modelState: Partial<ModelState>,
        sensState: Partial<BaseSensitivityState>, expectedSensMsg: string, expectedMultiSensMsg: string) => {
        const sensStore = getStore(hasRunner, modelState, sensState);
        const sensSut = baseSensitivity(sensStore, false);
        expect(sensSut.updateMsg.value).toBe(expectedSensMsg);
        const multiSensStore = getStore(hasRunner, modelState, {}, sensState);
        const multiSensSut = baseSensitivity(multiSensStore, true);
        expect(multiSensSut.updateMsg.value).toBe(expectedMultiSensMsg);
    };

    it("returns empty update message when no update required", () => {
        expectUpdateMsgForSensAndMultiSens(true, {}, {}, "", "");
    });

    it("returns empty update message when update required, but there has been no run yet", () => {
        expectUpdateMsgForSensAndMultiSens(true, { compileRequired: true }, { result: null }, "", "");
    });

    it("returns expected update message when compile required", () => {
        expectUpdateMsgForSensAndMultiSens(true, { compileRequired: true }, {},
            "Model code has been updated. Compile code and Run Sensitivity to update.",
            "Model code has been updated. Compile code and Run Multi-sensitivity to update.");
    });

    it("returns expected update message when there are no selected variables", () => {
        expectUpdateMsgForSensAndMultiSens(true, { selectedVariables: [] }, {},
            "Please select at least one variable.", "Please select at least one variable.");
    });

    it("returns expected update message when some update required values are true", () => {
        const sensitivityUpdateRequired = {
            modelChanged: true,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        };
        expectUpdateMsgForSensAndMultiSens(true, {}, { sensitivityUpdateRequired },
            "Plot is out of date: model code has been recompiled. Run Sensitivity to update.",
            "Status is out of date: model code has been recompiled. Run Multi-sensitivity to update.");
    });
});
