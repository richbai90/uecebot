import console from 'console';

const { assert } = console;
console.assert = function (cond: boolean, text: string, dontThrow: boolean) {
  assert(cond);
  if (!cond) {
    if (dontThrow) debugger;
    throw new Error(text || 'Assertion Failed');
  }
};
