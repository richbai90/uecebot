import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
require('dotenv').config(); // eslint-disable-line
const { assert } = console;
console.assert = function (cond: boolean, text: string, dontThrow: boolean) {
  assert(cond);
  if (!cond) {
    if (dontThrow) debugger;
    throw new Error(text || 'Assertion Failed');
  }
};

Sentry.init({
  dsn: 'https://773b12dfa0d5486e8f17984a436cc32c@o4504557293469696.ingest.sentry.io/4504557296549888',
  integrations: [
    new RewriteFrames({
      root: global.__rootdir__,
    }),
  ],
});

declare global {
  var __rootdir__: string; // eslint-disable-line
}
