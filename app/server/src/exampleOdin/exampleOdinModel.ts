export const exampleOdinModel = `"use strict";

class Odin {
    constructor (base, user, unusedUserAction) {
      this.base = base;  
      this.internal = {
        initial_y1: 10,
        initial_y2: 1,
        initial_y3: 1
      };
      this.coef = {
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
  
      this.setUser(user, unusedUserAction);
    }
    setUser = function(user, unusedUserAction) {
      this.base.checkUser(user, ["b", "R", "sigma"], unusedUserAction);
      const internal = this.internal;
      this.base.getUser(user, "b", internal, null, 8 / 3, null, null, false);
      this.base.getUser(user, "R", internal, null, 28, null, null, false);
      this.base.getUser(user, "sigma", internal, null, 10, null, null, false);
      this.updateMetadata();
    }
    rhs(t, state, dstatedt) {
      const internal = this.internal;
      const y1 = state[0];
      const y2 = state[1];
      const y3 = state[2];
      dstatedt[0] = internal.sigma * (y2 - y1);
      dstatedt[1] = internal.R * y1 - y2 - y1 * y3;
      dstatedt[2] = - internal.b * y3 + y1 * y2;
    }
    rhsEval = function(t, state) {
      const dstatedt = this.base.zeros(state.length);
      this.rhs(t, state, dstatedt);
      return dstatedt;
    }
    initial = function(t) {
      const internal = this.internal;
      const state = this.base.zeros(3);
      state[0] = internal.initial_y1;
      state[1] = internal.initial_y2;
      state[2] = internal.initial_y3;
      return state;
    }
    run(times, y0, control) {
      return integrateOdin(this, times, y0, control); 
    }
    updateMetadata() {
      this.metadata = {};
      this.metadata.ynames = ["t", "y1", "y2", "y3"];
      this.metadata.interpolateTimes = null;
      this.metadata.internalOrder = {
        b: null,
        initial_y1: null,
        initial_y2: null,
        initial_y3: null,
        R: null,
        sigma: null
      };
      this.metadata.variableOrder = {
        y1: null,
        y2: null,
        y3: null
      }
      this.metadata.outputOrder = null;
    }
}  

Odin;
`;
