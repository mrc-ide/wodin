export const exampleOdinModel = `
var odin = {};
odin.odin = (function() {
  function odin(helpers, user, unusedUserAction) {
    this.helpers = helpers;  
    this.internal = {};
    var internal = this.internal;
    internal.initial_y1 = 10;
    internal.initial_y2 = 1;
    internal.initial_y3 = 1;
    this.setUser(user, unusedUserAction);
  }
  odin.prototype.setUser = function(user, unusedUserAction) {
    this.helpers.checkUser(user, ["b", "R", "sigma"], unusedUserAction);
    var internal = this.internal;
    this.helpers.getUser(user, "b", internal, null, 8 / 3, null, null, false);
    this.helpers.getUser(user, "R", internal, null, 28, null, null, false);
    this.helpers.getUser(user, "sigma", internal, null, 10, null, null, false);
    this.updateMetadata();
  };
  odin.prototype.rhs = function(t, state, dstatedt) {
    var internal = this.internal;
    var y1 = state[0];
    var y2 = state[1];
    var y3 = state[2];
    dstatedt[0] = internal.sigma * (y2 - y1);
    dstatedt[1] = internal.R * y1 - y2 - y1 * y3;
    dstatedt[2] = - internal.b * y3 + y1 * y2;
  };
  odin.prototype.interpolateTime = null;
  odin.prototype.rhsEval = function(t, state) {
    var dstatedt = this.helpers.zeros(state.length);
    this.rhs(t, state, dstatedt);
    return dstatedt;
  };
  odin.prototype.initial = function(t) {
    var internal = this.internal;
    var state = this.helpers.zeros(3);
    state[0] = internal.initial_y1;
    state[1] = internal.initial_y2;
    state[2] = internal.initial_y3;
    return state;
  };
  odin.prototype.run = function(times, y0, control) {
    return integrateOdin(this, times, y0, control);
  };
  odin.prototype.coef = {
    b: {
      has_default: false, 
      default: 8 / 3, 
      rank: 0, 
      min: -Infinity, 
      max: Infinity, 
      integer: false
    }, 
    R: {
      has_default: false, 
      default: 28, 
      rank: 0, 
      min: -Infinity, 
      max: Infinity, 
      integer: false
    }, 
    sigma: {
      has_default: false, 
      default: 10, 
      rank: 0, 
      min: -Infinity, 
      max: Infinity, 
      integer: false
    }
  };
  odin.prototype.updateMetadata = function() {
    this.metadata = {};
    var internal = this.internal;
    this.metadata.ynames = ["t", "y1", "y2", "y3"];
    this.metadata.interpolateTimes = null;
    this.metadata.internalOrder = {
  "b": null,
  "initial_y1": null,
  "initial_y2": null,
  "initial_y3": null,
  "R": null,
  "sigma": null
};
    this.metadata.variableOrder = {
  "y1": null,
  "y2": null,
  "y3": null
};
    this.metadata.outputOrder = null;
  };
  return odin;
}());
    
odin;    
`;
