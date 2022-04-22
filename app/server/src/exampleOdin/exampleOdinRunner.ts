export const exampleOdinRunner = `"use strict";

class OdinRunner {
    constructor(dopri) {
        this.dopri = dopri;
    }
    grid(from, to, len) {
        const dx = (to - from) / (len - 1);
        const x = [];
        for (let i = 0; i < len; ++i) {
            x.push(from + i * dx);
        }
        return x;
    }
    runModel(pars, tEnd, nPoints, odin) {
        const model = new odin(OdinBase, pars);
        const tStart = 0;
        const times = this.grid(tStart, tEnd, nPoints);
        const y0 = model.initial(tStart);
        const control = {};
    
        const rhs = function(t, y, dydt) {
            model.rhs(t, y, dydt);
        }
    
        const nms = model.metadata.ynames.slice(1);
        
        const solver = new this.dopri.Dopri(rhs, y0.length, control, null);
        solver.initialise(tStart, y0);
        const solution = solver.run(tEnd);
        
        const grid = this.grid; // Need to do this to put grid into function closure
        
        return function(t0, t1) {
            const t = grid(Math.max(0, t0), Math.min(t1, tEnd), nPoints);
            const y = solution(t);
            return y[0].map((_, i) => ({
                x: t, y: y.map(row => row[i]), name: nms[i]}));
        }
    }
}

class OdinBase {
    static isMissing(x) {
        return x === undefined || x === null ||
            (typeof x === "number" && isNaN(x));
    }
    static setDifference(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
          if (b.indexOf(a[i]) === -1) {
            result.push(a[i]);
          }
        }
        return result;
    }
    static checkUser(user, allowed, unusedUserAction) {
        if (unusedUserAction === undefined) {
            unusedUserAction = "stop";
        }
        if (unusedUserAction === "ignore") {
            return;
        }
        const err = OdinBase.setDifference(Object.keys(user), allowed);
        if (err.length > 0) {
            const msg = "Unknown user parameters: " + err.join(", ");
    
            if (unusedUserAction === "message") {
                odinMessage(msg);
            } else if (unusedUserAction === "warning") {
                odinWarning(msg);
            } else if (unusedUserAction === "stop") {
                throw Error(msg);
            } else {
                throw Error(msg + " (and invalid value for unusedUserAction)");
            }
        }
    }
    static getUser(user, name, internal, size, defaultValue,min, max, isInteger) {
        const value = user[name];
        if (OdinBase.isMissing(value)) {
            if (OdinBase.isMissing(internal[name])) {
                if (defaultValue === null) {
                    throw Error("Expected a value for '" + name + "'");
                } else {
                    internal[name] = defaultValue;
                }
            }
        } else {
            if (typeof value !== "number") {
                if (typeof value === "string") {
                    throw Error("Expected a numeric value for '" + name + "'");
                } else {
                    throw Error("Expected a scalar numeric for '" + name + "'");
                }
            }
            if (min !== null && value < min) {
                throw Error("Expected '" + name + "' to be at least " + min);
            }
            if (max !== null && value > min) {
                throw Error("Expected '" + name + "' to be at most " + max);
            }
            if (isInteger && !numberIsInteger(value)) {
                throw Error("Expected '" + name + "' to be integer-like");
            }

            internal[name] = value;
        }
    }
    static zeros(n) {
        const ret = new Array(n);
        for (let i = 0; i < n; ++i) {
            ret[i] = 0;
        }
        return ret;
    }
}

OdinRunner;
`;
