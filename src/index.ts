// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import { assert } from 'console';
import 'core-js';
import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Events,
  Interaction,
} from 'discord.js';
import connect from './utils/connect';
import * as Sentry from '@sentry/node';

const bots: Map<symbol, Client> = new Map<symbol, Client>();
const TAKey = Symbol('TA');
const HelperKey = Symbol('HELPER');
const ta = connect(TAKey, bots);
const helper = connect(HelperKey, bots);

const transaction = Sentry.startTransaction({
  op: 'ECEBOT',
  name: 'ECE BOT',
});

assert(ta && helper);

helper.on(Events.InteractionCreate, async (i) => {
  let s = createSpan(i);
  try {
    if (i.isAutocomplete()) {
      s = transaction.startChild({
        op: 'AUTOCOMPLETE',
        description: 'Auto Complete',
      });
      const interaction = i as AutocompleteInteraction;
      await helper.commands.get(interaction.commandName).autoComplete(interaction);
    } else if (i.isChatInputCommand()) {
      s = transaction.startChild({
        op: 'EXEC',
        description: 'Executing Command',
      });

      const interaction = i as ChatInputCommandInteraction;
      console.log(interaction.commandName);
      console.log(helper.commands.keys());
      await helper.commands.get(interaction.commandName).execute(interaction);
    }
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    if (s) {
      console.log('Transaction Complete');
      s.finish();
    }
  }
});

function createSpan(i: Interaction<CacheType>): Sentry.Span {
  const s: Sentry.Span | null = null;
  Sentry.setUser({ id: i.user.id, username: i.user.username });
  Sentry.setContext(
    'INTERACTION',
    JSON.parse(
      JSON.stringify(
        i,
        (_, v) => (typeof v === 'bigint' ? v.toString() : v), // return everything else unchanged
      ),
    ),
  );

  return s;
}
