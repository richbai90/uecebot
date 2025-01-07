global.__rootdir__ = __dirname || process.cwd();
const Sentry = require('@sentry/node'); //eslint-disable-line
// capture any errors that aren't already handled by your app

Sentry.init({
  dsn: 'https://773b12dfa0d5486e8f17984a436cc32c@o4504557293469696.ingest.sentry.io/4504557296549888',
  integrations: [
    Sentry.rewriteFramesIntegration({
      root: global.__rootdir__,
    }),
  ],
});

const transaction = Sentry.startSpan({ op: 'INIT', name: 'Initializing' }, async () => {
  try {
    const { setup } = require('./dist/lib/setup.js') //eslint-disable-line
    await setup();
    require('./dist/lib/index.js');
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
  }
});
