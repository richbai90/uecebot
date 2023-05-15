global.__rootdir__ = __dirname || process.cwd();
require('./dist/lib/setup.js');
const Sentry = require('@sentry/node'); //eslint-disable-line
// capture any errors that aren't already handled by your app
const transaction = Sentry.startTransaction({ op: 'INIT', name: 'Initializing' });
try {
  require('./dist/lib/index.js');
} catch (err) {
  console.log(err);
  Sentry.captureException(err);
} finally {
  transaction.finish();
}
