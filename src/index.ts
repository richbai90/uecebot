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
  PartialUser,
  User,
} from 'discord.js';
import connect from './utils/connect';
import { parseJson } from './utils/safely';
import * as Sentry from '@sentry/node';
import { addRole, rmRole } from './behaviors/helper/club_react';

const bots: Map<symbol, Client> = new Map<symbol, Client>();
const TAKey = Symbol('TA');
const HelperKey = Symbol('HELPER');
const ta = connect(TAKey, bots);
const helper = connect(HelperKey, bots);

assert(ta && helper);

helper.on(Events.InteractionCreate, async (i) => {
  let s = createSpan('InteractionCreate', i.user, i);
  try {
    if (i.isAutocomplete()) {
      s = s.setAttributes({
        op: 'AUTOCOMPLETE',
        description: 'Auto Complete',
      });
      const interaction = i as AutocompleteInteraction;
      await helper.commands.get(interaction.commandName).autoComplete(interaction);
    } else if (i.isChatInputCommand()) {
      s.setAttributes({
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
      s.end(Date.now());
    }
  }
});

// helper.on(Events.MessageReactionAdd, async (reaction, user) => {
// const span = createSpan('MessageReactionAdd', user, null, reaction);
// try {
// await addRole(reaction, user);
// } catch (e) {
// Sentry.captureException(e);
// } finally {
// span?.end(Date.now());
// }
// });
//
// helper.on(Events.MessageReactionRemove, async (reaction, user) => {
// const span = createSpan('MessageReactionRemove', user, null, reaction);
// await rmRole(reaction, user);
// });

function createSpan(
  name: string,
  user: User | PartialUser,
  i: Interaction<CacheType> | null,
  extra?: unknown,
): Sentry.Span {
  Sentry.setUser(JSON.parse(JSON.stringify(user)));
  const s = Sentry.startInactiveSpan({
    name,
  });
  const safeExtra = parseJson(extra);
  if (i) {
    s.setAttributes({ kind: 'INTERACTION', ...parseJson(i), ...safeExtra });
  } else {
    s.setAttributes({ kind: safeExtra?.context || 'UNKNOWN', ...safeExtra });
  }

  return s;
}
