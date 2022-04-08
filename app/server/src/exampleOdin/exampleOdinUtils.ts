export const exampleOdinUtils = `(function(){
    var OdinRunner = function(helpers, dopri) {
        this.helpers = helpers;
        this.dopri = dopri;
    };
    
    OdinRunner.prototype = (function () {
        return {
            runModel(pars, tEnd, nPoints, odin) {
                var model = new odin.odin(this.helpers, pars);
                var tStart = 0;
                var times = this.helpers.grid(tStart, tEnd, nPoints);
                var y0 = model.initial(tStart);
                var control = {};
            
                var rhs = function(t, y, dydt) {
                    model.rhs(t, y, dydt);
                }
            
                var nms = model.metadata.ynames.slice(1);
                
                var solver = new this.dopri.Dopri(rhs, y0.length, control, null);
                solver.initialise(tStart, y0);
                var solution = solver.run(tEnd);
                
                var grid = this.helpers.grid; // Need to do this to put grid into function closure
                
                return function(t0, t1) {
                    var t = grid(Math.max(0, t0), Math.min(t1, tEnd), nPoints);
                    var y = solution(t);
                    return y[0].map((_, i) => ({
                        x: t, y: y.map(row => row[i]), name: nms[i]}));
                }
            }
        };
    }());
    
    var OdinHelpers = function() {};
    
    OdinHelpers.prototype = (function () {
        var isMissing = function(x) {
            return x === undefined || x === null ||
                (typeof x === "number" && isNaN(x));
        }
    
        var setDifference = function(a, b) {
            var result = [];
            for (var i = 0; i < a.length; i++) {
              if (b.indexOf(a[i]) === -1) {
                result.push(a[i]);
              }
            }
            return result;
          }
    
        return {
            checkUser: function(user, allowed, unusedUserAction) {
                if (unusedUserAction === undefined) {
                    unusedUserAction = "stop";
                }
                if (unusedUserAction === "ignore") {
                    return;
                }
                var err = setDifference(Object.keys(user), allowed);
                if (err.length > 0) {
                    var msg = "Unknown user parameters: " + err.join(", ");
            
                    if (unusedUserAction === "message") {
                        odinMessage(msg); // does not exist?
                    } else if (unusedUserAction === "warning") {
                        odinWarning(msg); // does not exist?
                    } else if (unusedUserAction === "stop") {
                        throw Error(msg);
                    } else {
                        throw Error(msg + " (and invalid value for unusedUserAction)");
                    }
                }
            },
            getUser: function(user, name, internal, size, defaultValue,min, max, isInteger) {
                var value = user[name];
                if (isMissing(value)) {
                    if (isMissing(internal[name])) {
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
            },
            grid: function(from, to, len) {
                var dx = (to - from) / (len - 1);
                var x = [];
                for (var i = 0; i < len; ++i) {
                    x.push(from + i * dx);
                }
                return x;
            },
            zeros: function(n) {
                var ret = new Array(n);
                for (var i = 0; i < n; ++i) {
                    ret[i] = 0;
                }
                return ret;
            }
        };
    }());
    
    return {
      "runner": OdinRunner,
      "helpers": OdinHelpers
    };
})()`;
