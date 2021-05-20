"use strict";
require('dotenv').config(); // eslint-disable-line
var assert = console.assert;
console.assert = function (cond, text, dontThrow) {
    assert(cond);
    if (!cond) {
        if (dontThrow)
            debugger;
        throw new Error(text || 'Assertion Failed');
    }
};
//# sourceMappingURL=setup.js.map