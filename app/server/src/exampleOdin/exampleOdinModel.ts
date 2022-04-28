export const exampleOdinModel = `class Odin {
  constructor(base, user, unusedUserAction) {
    this.base = base;
    this.internal = {};
    var internal = this.internal;
    internal.K = 100;
    internal.r = 0.20000000000000001;
    this.setUser(user, unusedUserAction);
  }
  coef = {N0: {has_default: false, default: 1, rank: 0, min: -Infinity, max: Infinity, integer: false}}
  rhs(t, state, dstatedt) {
    var internal = this.internal;
    var N = state[0];
    dstatedt[0] = internal.r * N * (1 - N / internal.K);
  }
  run(tStart, tEnd, y0, control, Dopri) {
    return this.base.run(tStart, tEnd, y0, control, this, Dopri);
  }
  initial(t) {
    var internal = this.internal;
    var state = this.base.zeros(1);
    state[0] = internal.initial_N;
    return state;
  }
  updateMetadata() {
    this.metadata = {};
    var internal = this.internal;
    this.metadata.ynames = ["t", "N"];
    this.metadata.internalOrder = {K: null, N0: null, initial_N: null, r: null};
    this.metadata.variableOrder = {N: null};
    this.metadata.outputOrder = null;
  }
  setUser(user, unusedUserAction) {
    this.base.checkUser(user, ["N0"], unusedUserAction);
    var internal = this.internal;
    this.base.getUser(user, "N0", internal, null, 1, null, null, false);
    internal.initial_N = internal.N0;
    this.updateMetadata();
  }
}

Odin;
`;
