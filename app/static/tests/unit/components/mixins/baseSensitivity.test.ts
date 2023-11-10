import Vuex from "vuex";
import { nextTick } from "vue";
import { ModelState } from "../../../../src/app/store/model/state";
import baseSensitivity, { BaseSensitivityMixin } from "../../../../src/app/components/mixins/baseSensitivity";
import { BaseSensitivityState } from "../../../../src/app/store/sensitivity/state";
import { noSensitivityUpdateRequired } from "../../../../src/app/store/sensitivity/sensitivity";
import { AppState } from "../../../../src/app/store/appState/state";
import { BaseSensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import { BaseSensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import mock = jest.mock;

describe("baseSensitivity mixin", () => {
  const mockSensSetUserSummaryDownloadFileName = jest.fn();
  const mockMultiSensSetUserSummaryDownloadFileName = jest.fn();

  const mockSensDownloadSummary = jest.fn();
  const mockMultiSensDownloadSummary = jest.fn();

  const getStore = (
    hasRunner = true,
    modelState: Partial<ModelState> = {},
    sensitivityState: Partial<BaseSensitivityState> = {},
    multiSensitivityState: Partial<BaseSensitivityState> = {}
  ) => {
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
        run: {
          namespace: true,
          state: {
            endTime: 100
          }
        },
        multiSensitivity: {
          namespaced: true,
          state: {
            downloading: false,
            sensitivityUpdateRequired: noSensitivityUpdateRequired(),
            result: {
              batch: {
                solutions: [{}]
              }
            },
            ...multiSensitivityState
          },
          mutations: {
            [BaseSensitivityMutation.SetUserSummaryDownloadFileName]: mockMultiSensSetUserSummaryDownloadFileName
          },
          actions: {
            [BaseSensitivityAction.DownloadSummary]: mockMultiSensDownloadSummary
          }
        },
        sensitivity: {
          namespaced: true,
          state: {
            downloading: false,
            sensitivityUpdateRequired: noSensitivityUpdateRequired(),
            plotSettings: {
              time: 50
            },
            result: {
              batch: {
                solutions: [{}]
              }
            },
            ...sensitivityState
          },
          mutations: {
            [BaseSensitivityMutation.SetUserSummaryDownloadFileName]: mockSensSetUserSummaryDownloadFileName
          },
          actions: {
            [BaseSensitivityAction.DownloadSummary]: mockSensDownloadSummary
          }
        }
      } as any
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  const expectUpdateMsgForSensAndMultiSens = (
    hasRunner: true,
    modelState: Partial<ModelState>,
    sensState: Partial<BaseSensitivityState>,
    expectedSensMsg: string,
    expectedMultiSensMsg: string
  ) => {
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
    expectUpdateMsgForSensAndMultiSens(
      true,
      { compileRequired: true },
      {},
      "Model code has been updated. Compile code and Run Sensitivity to update.",
      "Model code has been updated. Compile code and Run Multi-sensitivity to update."
    );
  });

  it("returns expected update message when there are no selected variables", () => {
    expectUpdateMsgForSensAndMultiSens(
      true,
      { selectedVariables: [] },
      {},
      "Please select at least one variable.",
      "Please select at least one variable."
    );
  });

  it("returns expected update message when some update required values are true", () => {
    const sensitivityUpdateRequired = {
      modelChanged: true,
      parameterValueChanged: false,
      endTimeChanged: false,
      sensitivityOptionsChanged: false,
      numberOfReplicatesChanged: false,
      advancedSettingsChanged: false
    };
    expectUpdateMsgForSensAndMultiSens(
      true,
      {},
      { sensitivityUpdateRequired },
      "Plot is out of date: model code has been recompiled. Run Sensitivity to update.",
      "Status is out of date: model code has been recompiled. Run Multi-sensitivity to update."
    );
  });

  const testForSensAndMultiSens = (
    state: Partial<BaseSensitivityState>,
    test: (mixin: BaseSensitivityMixin) => void
  ) => {
    let store = getStore(true, {}, state, {});
    test(baseSensitivity(store, false));
    store = getStore(true, {}, {}, state);
    test(baseSensitivity(store, true));
  };

  it("returns downloading", () => {
    testForSensAndMultiSens({ downloading: true }, (mixin) => {
      expect(mixin.downloading.value).toBe(true);
    });
    testForSensAndMultiSens({}, (mixin) => {
      expect(mixin.downloading.value).toBe(false);
    });
  });

  it("can download summary when no update required and batch exists", () => {
    testForSensAndMultiSens({}, (mixin) => {
      expect(mixin.canDownloadSummary.value).toBe(true);
    });
  });

  it("cannot download summary when update required", () => {
    const state = {
      sensitivityUpdateRequired: {
        ...noSensitivityUpdateRequired(),
        modelChanged: true
      }
    };
    testForSensAndMultiSens(state, (mixin) => {
      expect(mixin.canDownloadSummary.value).toBe(false);
    });
  });

  it("cannot download summary when no batch exists", () => {
    const state = {
      result: {}
    } as any;
    testForSensAndMultiSens(state, (mixin) => {
      expect(mixin.canDownloadSummary.value).toBe(false);
    });
  });

  it("returns download summary user file name", () => {
    const state = { userSummaryDownloadFileName: "test.xlsx" };
    testForSensAndMultiSens(state, (mixin) => {
      expect(mixin.downloadSummaryUserFileName.value).toBe("test.xlsx");
    });
  });

  it("writes download summary user file name", () => {
    const sensSut = baseSensitivity(getStore(), false);
    sensSut.downloadSummaryUserFileName.value = "new.xlsx";
    expect(mockSensSetUserSummaryDownloadFileName.mock.calls[0][1]).toBe("new.xlsx");

    const multiSensSut = baseSensitivity(getStore(), true);
    multiSensSut.downloadSummaryUserFileName.value = "newMulti.xlsx";
    expect(mockMultiSensSetUserSummaryDownloadFileName.mock.calls[0][1]).toBe("newMulti.xlsx");
  });

  it("downloadSummary dispatches action", () => {
    const sensSut = baseSensitivity(getStore(), false);
    sensSut.downloadSummary({ fileName: "test.xlsx" });
    expect(mockSensDownloadSummary.mock.calls[0][1]).toBe("test.xlsx");

    const multiSensSut = baseSensitivity(getStore(), true);
    multiSensSut.downloadSummary({ fileName: "testMulti.xlsx" });
    expect(mockMultiSensDownloadSummary.mock.calls[0][1]).toBe("testMulti.xlsx");
  });
});
