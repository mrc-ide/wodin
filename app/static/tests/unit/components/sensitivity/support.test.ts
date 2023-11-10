import {
  sensitivityUpdateRequiredExplanation,
  verifyValidPlotSettingsTime
} from "../../../../src/app/components/sensitivity/support";
import { mockBasicState, mockRunState, mockSensitivityState } from "../../../mocks";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";

describe("construct actionable fit update messages from fit state changes", () => {
  const base = {
    modelChanged: false,
    parameterValueChanged: false,
    endTimeChanged: false,
    sensitivityOptionsChanged: false,
    numberOfReplicatesChanged: false,
    advancedSettingsChanged: false
  };

  it("shows fallback when no reason can be found", () => {
    expect(sensitivityUpdateRequiredExplanation(base, false)).toBe(
      "Plot is out of date: unknown reasons, contact the administrator, as this is unexpected. " +
        "Run Sensitivity to update."
    );
    expect(sensitivityUpdateRequiredExplanation(base, true)).toBe(
      "Status is out of date: unknown reasons, contact the administrator, as this is unexpected. " +
        "Run Multi-sensitivity to update."
    );
  });

  it("shows sensible message when everything has changed", () => {
    const everything = {
      modelChanged: true,
      parameterValueChanged: true,
      endTimeChanged: true,
      sensitivityOptionsChanged: true,
      numberOfReplicatesChanged: true,
      advancedSettingsChanged: true
    };
    expect(sensitivityUpdateRequiredExplanation(everything, false)).toBe(
      "Plot is out of date: model code has been recompiled and advanced settings have been " +
        "changed. Run Sensitivity to update."
    );
    expect(sensitivityUpdateRequiredExplanation(everything, true)).toBe(
      "Status is out of date: model code has been recompiled and advanced settings have been " +
        "changed. Run Multi-sensitivity to update."
    );
  });

  const expectSpecificMessages = (multiSens: boolean, prefix: string, suffix: string) => {
    const module = multiSens ? "Multi-sensitivity" : "Sensitivity";
    expect(sensitivityUpdateRequiredExplanation({ ...base, modelChanged: true }, multiSens)).toBe(
      `${prefix}: model code has been recompiled. ${suffix}`
    );
    expect(sensitivityUpdateRequiredExplanation({ ...base, parameterValueChanged: true }, multiSens)).toBe(
      `${prefix}: parameters have been changed. ${suffix}`
    );
    expect(sensitivityUpdateRequiredExplanation({ ...base, endTimeChanged: true }, multiSens)).toBe(
      `${prefix}: end time has changed. ${suffix}`
    );
    expect(sensitivityUpdateRequiredExplanation({ ...base, sensitivityOptionsChanged: true }, multiSens)).toBe(
      `${prefix}: ${module} options have been changed. ${suffix}`
    );
    expect(sensitivityUpdateRequiredExplanation({ ...base, numberOfReplicatesChanged: true }, multiSens)).toBe(
      `${prefix}: number of replicates has changed. ${suffix}`
    );
    expect(sensitivityUpdateRequiredExplanation({ ...base, advancedSettingsChanged: true }, multiSens)).toBe(
      `${prefix}: advanced settings have been changed. ${suffix}`
    );
  };

  it("gives specific messages when little has changed for sensitivity", () => {
    const prefix = "Plot is out of date";
    const suffix = "Run Sensitivity to update.";
    expectSpecificMessages(false, prefix, suffix);
  });

  it("gives specific messages when little has changed for multiSensitivity", () => {
    const prefix = "Status is out of date";
    const suffix = "Run Multi-sensitivity to update.";
    expectSpecificMessages(true, prefix, suffix);
  });
});

describe("verifies valid plot settings time", () => {
  const getState = (plotSettingsTime: number | null, runEndTime: number) => {
    return mockBasicState({
      sensitivity: mockSensitivityState({
        plotSettings: { time: plotSettingsTime } as any
      }),
      run: mockRunState({ endTime: runEndTime })
    });
  };

  const commit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectPlotSettingsCommit = (expectedValue: number) => {
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(`sensitivity/${SensitivityMutation.SetPlotTime}`, expectedValue);
  };

  it("if time is null, sets to run end time", () => {
    const state = getState(null, 100);
    verifyValidPlotSettingsTime(state, commit);
    expectPlotSettingsCommit(100);
  });

  it("if time is less than 0, sets 0", () => {
    const state = getState(-5, 100);
    verifyValidPlotSettingsTime(state, commit);
    expectPlotSettingsCommit(0);
  });

  it("if time is greater than run end time, sets to run end time", () => {
    const state = getState(200, 100);
    verifyValidPlotSettingsTime(state, commit);
    expectPlotSettingsCommit(100);
  });

  it("does not update time if already valid", () => {
    const state = getState(50, 100);
    expect(commit).not.toHaveBeenCalled();
  });
});
