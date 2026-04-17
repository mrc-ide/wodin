import Vuex from "vuex";
import { AppTypeToState, mockStates } from "../testUtils";
import { AppType } from "@/store/appState/state";
import { mockFitDataState, mockModelFitState, mockModelState, mockRunState, mockSensitivityState } from "../mocks";
import { DataType, defaultGraphConfig } from "@/store/graphs/state";
import { getPlotData } from "@/plotData";
import { WodinPlotData } from "@/plot";
import { FitDataGetter } from "@/store/fitData/getters";

describe("plot data", () => {
  const odeSolution = () => ({
    x: [0, 1],
    values: [
      { name: "S", y: [3, 4], description: "Individual" },
      { name: "I", y: [5, 6], description: "Mean" },
    ]
  });

  const odeSolutionSens = () => ({
    x: [0, 1],
    values: [
      { name: "S", y: [-3, -4], description: "Individual" },
      { name: "I", y: [-5, -6], description: "Mean" },
    ]
  });

  const odeSolutionSensValueAtTime = () => ({
    x: [{ a: 1 }, { a: 1.1 }],
    values: [
      { name: "S", y: [-0.3, -0.4], description: "Individual" },
      { name: "I", y: [-0.5, -0.6], description: "Mean" },
    ]
  });

  const odeSolutionSensExtreme = () => ({
    x: [{ a: 1 }, { a: 1.1 }],
    values: [
      { name: "S", y: [-0.03, -0.04], description: "Individual" },
      { name: "I", y: [-0.05, -0.06], description: "Mean" },
    ]
  });

  const parSet1Solution = () => ({
    x: [0, 1],
    values: [
      { name: "S", y: [30, 40] },
      { name: "I", y: [50, 60] },
    ]
  });

  const parSet1SolutionSens = () => ({
    x: [0, 1],
    values: [
      { name: "S", y: [-30, -40] },
      { name: "I", y: [-50, -60] },
    ]
  });

  const parSet1SolutionValueAtTime = () => ({
    x: [{ a: 1 }, { a: 1.1 }],
    values: [
      { name: "S", y: [-0.31, -0.41] },
      { name: "I", y: [-0.51, -0.61] },
    ]
  });

  const parSet1SolutionExtreme = () => ({
    x: [{ a: 1 }, { a: 1.1 }],
    values: [
      { name: "S", y: [-0.031, -0.041] },
      { name: "I", y: [-0.051, -0.061] },
    ]
  });

  const parSet2Solution = () => ({
    x: [0, 1],
    values: [
      { name: "S", y: [300, 400] },
      { name: "I", y: [500, 600] },
    ]
  });

  const parSet2SolutionSens = () => ({
    x: [0, 1],
    values: [
      { name: "S", y: [-300, -400] },
      { name: "I", y: [-500, -600] },
    ]
  });

  const parSet2SolutionValueAtTime = () => ({
    x: [{ a: 1 }, { a: 1.1 }],
    values: [
      { name: "S", y: [-0.32, -0.42] },
      { name: "I", y: [-0.52, -0.62] },
    ]
  });

  const parSet2SolutionExtreme = () => ({
    x: [{ a: 1 }, { a: 1.1 }],
    values: [
      { name: "S", y: [-0.032, -0.042] },
      { name: "I", y: [-0.052, -0.062] },
    ]
  });

  const odeI = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I",
    },
    points: [
      { x: 0, y: 5 },
      { x: 1, y: 6 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: undefined,
      strokeWidth: 2,
    },
  };

  const odeISens = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I (a=1.100)",
    },
    points: [
      { x: 0, y: -5 },
      { x: 1, y: -6 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: undefined,
      strokeWidth: 1,
    },
  };

  const odeIValueAtTime = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I",
    },
    points: [
      { x: 1, y: -0.5 },
      { x: 1.1, y: -0.6 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: undefined,
      strokeWidth: 2,
    },
  };

  const odeIExtreme = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I",
    },
    points: [
      { x: 1, y: -0.05 },
      { x: 1.1, y: -0.06 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: undefined,
      strokeWidth: 2,
    },
  };

  const odeParSetI = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I (rand1)",
    },
    points: [
      { x: 0, y: 50 },
      { x: 1, y: 60 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: "3",
      strokeWidth: 2,
    },
  };

  const odeParSetISens = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I (a=1.100 rand1)",
    },
    points: [
      { x: 0, y: -50 },
      { x: 1, y: -60 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: "3",
      strokeWidth: 1,
    },
  };

  const odeParSetIValueAtTime = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I (rand1)",
    },
    points: [
      { x: 1, y: -0.51 },
      { x: 1.1, y: -0.61 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: "3",
      strokeWidth: 1,
    },
  };

  const odeParSetIExtreme = {
    metadata: {
      color: "green",
      name: "I",
      tooltipName: "I (rand1)",
    },
    points: [
      { x: 1, y: -0.051 },
      { x: 1.1, y: -0.061 },
    ],
    style: {
      opacity: undefined,
      strokeColor: "green",
      strokeDasharray: "3",
      strokeWidth: 1,
    },
  };

  const stochasticS = {
    metadata: {
      color: "red",
      name: "S",
      tooltipName: "S",
    },
    points: [
      { x: 0, y: 3 },
      { x: 1, y: 4 },
    ],
    style: {
      opacity: 0.5,
      strokeColor: "red",
      strokeWidth: 0.5,
    },
  };

  const stochasticI = {
        metadata: {
          color: "green",
          name: "I (mean)",
          tooltipName: "I (mean)",
        },
        points: [
          { x: 0, y: 5 },
          { x: 1, y: 6 },
        ],
        style: {
          opacity: 1,
          strokeColor: "green",
          strokeWidth: 2,
        },
      }

  const fitPoints = [
    {
      metadata: {
        color: "green",
        name: "Cases",
        tooltipName: "Cases",
      },
      style: {
        color: "green",
      },
      x: 0.2,
      y: 7,
    },
    {
      metadata: {
        color: "green",
        name: "Cases",
        tooltipName: "Cases",
      },
      style: {
        color: "green",
      },
      x: 0.8,
      y: 70,
    },
  ];

  const getStore = <T extends AppType>(appType: T) => {
    return new Vuex.Store<AppTypeToState[T]>({
      state: mockStates[appType],
      modules: {
        run: {
          state: mockRunState({
            resultOde: { solution: odeSolution } as any,
            resultDiscrete: { solution: odeSolution } as any,
            parameterSets: [
              {
                name: "Set1",
                displayName: "rand1",
                displayNameErrorMsg: "error1",
                parameterValues: { a: 1, b: 2 },
                hidden: false,
              },
              {
                name: "Set2",
                displayName: "rand2",
                displayNameErrorMsg: "error2",
                parameterValues: { a: 10, b: 20 },
                hidden: true,
              },
            ],
            parameterSetResults: {
                Set1: { solution: parSet1Solution } as any,
                Set2: { solution: parSet2Solution } as any,
            }
          })
        },
        sensitivity: {
          state: mockSensitivityState({
            paramSettings: { parameterToVary: "a" } as any,
            result: {
              batch: {
                solutions: [odeSolutionSens],
                valueAtTime: odeSolutionSensValueAtTime,
                extreme: odeSolutionSensExtreme,
                pars: {
                  varying: [{ name: "a", values: [1.1] }]
                }
              }
            } as any,
            parameterSetResults: {
              Set1: {
                batch: {
                  solutions: [parSet1SolutionSens],
                  valueAtTime: parSet1SolutionValueAtTime,
                  extreme: parSet1SolutionExtreme,
                }
              } as any,
              Set2: {
                batch: {
                  solutions: [parSet2SolutionSens],
                  valueAtTime: parSet2SolutionValueAtTime,
                  extreme: parSet2SolutionExtreme,
                }
              } as any,
            }
          })
        },
        model: {
          state: mockModelState({
            paletteModel: {
              S: "red",
              I: "green",
            }
          })
        },
        fitData: {
          namespaced: true,
          state: mockFitDataState({
            data: [
              { Cases: 7, Y: 8, day: 0.2 },
              { Cases: 70, Y: 80, day: 0.8 },
            ],
            linkedVariables: { Cases: "I" },
            timeVariable: "day",
          }),
          getters: {
            [FitDataGetter.dataEnd]: () => 1,
            [FitDataGetter.link]: () => ({
              time: "day",
              data: "Cases",
              model: "I"
            }),
          }
        },
        modelFit: {
          state: mockModelFitState({
            result: { solution: odeSolution } as any
          })
        }
      }
    });
  }

  it("produces expected run traces for continuous data", () => {
    const store = getStore(AppType.Basic);
    const config = defaultGraphConfig("123");
    config.selectedVariables = ["I"];
    const data = getPlotData({ rootState: store.state } as any, config, DataType.Run);
    expect(data).toStrictEqual({ lines: [odeI, odeParSetI], points: fitPoints });
  });

  it("produces expected run traces for stochastic data", () => {
    const store = getStore(AppType.Stochastic);
    const config = defaultGraphConfig("123");
    config.selectedVariables = ["S", "I"];
    const data = getPlotData({ rootState: store.state } as any, config, DataType.Run);
    expect(data).toStrictEqual({ lines: [stochasticS, stochasticI], points: [] });
  });

  it("hides individual traces for stochastic data is number of replicates too high", () => {
    const store = getStore(AppType.Stochastic);
    store.state.run.numberOfReplicates = 9999;
    const config = defaultGraphConfig("123");
    config.selectedVariables = ["S", "I"];
    const data = getPlotData({ rootState: store.state } as any, config, DataType.Run);
    // removes S as it is individual
    expect(data).toStrictEqual({ lines: [stochasticI], points: [] });
  });

  it("produces expected fit traces for continuous data", () => {
    const store = getStore(AppType.Fit);
    const config = defaultGraphConfig("123");
    config.selectedVariables = ["I"];
    const data = getPlotData({ rootState: store.state, rootGetters: store.getters } as any, config, DataType.Fit);
    // no parameter sets here
    expect(data).toStrictEqual({ lines: [odeI], points: fitPoints });
  });

  it("produces expected sensitivity traces", () => {
    const store = getStore(AppType.Basic);
    const config = defaultGraphConfig("123");
    config.selectedVariables = ["I"];
    const data = getPlotData({ rootState: store.state } as any, config, DataType.Sensitivity);
    expect(data).toStrictEqual({ lines: [odeISens, odeI, odeParSetISens, odeParSetI], points: fitPoints });
  });

  it("produces expected sensitivity value at time", () => {
    const store = getStore(AppType.Basic);
    const config = defaultGraphConfig("123");
    config.selectedVariables = ["I"];
    const data = getPlotData({ rootState: store.state } as any, config, DataType.SensitivityValueAtTime);
    expect(data).toStrictEqual({ lines: [odeIValueAtTime, odeParSetIValueAtTime], points: [] });
  });

  it("produces expected sensitivity at extreme", () => {
    const store = getStore(AppType.Basic);
    const config = defaultGraphConfig("123");
    config.selectedVariables = ["I"];
    const data = getPlotData({ rootState: store.state } as any, config, DataType.SensitivityTimeAtExtreme);
    expect(data).toStrictEqual({ lines: [odeIExtreme, odeParSetIExtreme], points: [] });
  });
});
