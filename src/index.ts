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
  Collection,
  Events,
  Interaction,
  PartialUser,
  User,
} from 'discord.js';
import connect, { cache_guilds } from './utils/connect';
import { connect as dbconnect } from './utils/db';
import { parseJson } from './utils/safely';
import * as Sentry from '@sentry/node';
import { addRole, rmRole } from './behaviors/helper/club_react';
import { wait } from './utils/helpers';

const invites = new Collection(); // setup the collection
const bots: Map<symbol, Client> = new Map<symbol, Client>();
const HelperKey = Symbol('HELPER');
const helper = connect(HelperKey, bots);

assert(helper);

helper.on(Events.InteractionCreate, async (i) => {
  let s = createSpan('InteractionCreate', i.user, i);
  try {
    if (i.isAutocomplete()) {
      s = s.setAttributes({
        op: 'AUTOCOMPLETE',
        description: 'Auto Complete',
      });
      const interaction = i as AutocompleteInteraction;
      const cmd = helper.commands.get(interaction.commandName);
      if ('autocomplete' in cmd) await cmd.autoComplete(interaction);
      else throw new Error('Autocomplete attempted on a command with no autocomplete property.');
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

helper.on(Events.InviteCreate, async (invite) => {
  // when a new invite is created, store it
  helper.invites?.set(invite.guild.id, new Collection([[invite, invite.uses]]));
});

helper.on(Events.InviteDelete, async (invite) => {
  // delete the invite
  const invites = helper.invites?.get(invite.guild.id);
  invites.delete(invite);
});

helper.on('guildMemberAdd', async (member) => {
  const s = createSpan('GuildMemberAdded', member.user, null);
  try {
    // To compare, we need to load the current invite list.
    const newInvites = await member.guild.invites.fetch();
    // This is the *existing* invites for the guild.
    const oldInvites = helper.invites.get(member.guild.id);
    // Look through the invites, find the one for which the uses went up.
    const invite = newInvites.find((i) => i.uses > oldInvites.get(i));
    if (typeof invite == 'undefined') {
      throw new Error('Could not find a matching invite');
    }
    const client = await dbconnect();
    const role_id = (await client.query('select role_id from invites where invite_id = $1', [invite.url])).rows?.[0];
    const roles = await member.guild.roles.fetch();
    member.roles.add(roles.get(role_id));
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    s.end(Date.now());
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
