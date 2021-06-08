// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import { assert } from 'console';
import 'core-js';
import { Client } from 'discord.js';
import saveMessage from './behaviors/helper/saveMessage';
import execBehaviors from './behaviors/ta';
import connect, { asConnect } from './utils/connect';
import exec from './utils/exec';
const bots: Map<symbol, Client> = new Map<symbol, Client>();
const TAKey = Symbol('TA');
const HelperKey = Symbol('HELPER');
const ta = connect(TAKey, bots);
const helper = connect(HelperKey, bots);
const as = asConnect();
assert(ta && helper);

ta!.on('message', async (msg) => {
  if (await exec(msg, ta!)) return;
  execBehaviors(ta!, msg);
});

helper!.on('message', async (msg) => {
  //saveMessage(msg, as);
  if (await exec(msg, helper!)) return;
});
