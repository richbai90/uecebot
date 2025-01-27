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
import connect, { cache_invites } from './utils/connect';
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
      if ('autoComplete' in cmd) await cmd.autoComplete(interaction);
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
  const invites = helper.invites?.get(invite.guild.id);
  if (!invites) {
    Sentry.addBreadcrumb({
      category: 'invite_create',
      data: {
        invites: parseJson(
          helper.invites?.reduce(
            (acc, v, k) => ({
              ...acc,
              [k]: v.reduce((acc_, v_, k_) => ({ ...acc_, [k_]: { url: v_.url, uses: v_.uses } }), {}),
            }),
            {},
          ),
        ),
      },
    });
  }
  invites.set(invite.code, invite);
});

helper.on(Events.InviteDelete, async (invite) => {
  // delete the invite
  const invites = helper.invites?.get(invite.guild.id);
  if (!invites) {
    Sentry.addBreadcrumb({
      category: 'invite_create',
      data: {
        invites: parseJson(
          helper.invites?.reduce(
            (acc, v, k) => ({
              ...acc,
              [k]: v.reduce((acc_, v_, k_) => ({ ...acc_, [k_]: { url: v_.url, uses: v_.uses } }), {}),
            }),
            {},
          ),
        ),
      },
    });
  }
  invites.delete(invite.code);
});

helper.on('guildMemberAdd', async (member) => {
  const s = createSpan('GuildMemberAdded', member.user, null);
  try {
    // This is the *existing* invites for the guild.
    const oldInvites = helper.invites.get(member.guild.id).clone();
    // To compare, we need to load the current invite list.
    const newInvites = await member.guild.invites.fetch();
    // Look through the invites, find the one for which the uses went up.
    const invite = newInvites.find((i) => (oldInvites.get(i.code)?.uses ?? Infinity) < i.uses);
    if (typeof invite == 'undefined') {
      Sentry.addBreadcrumb({
        category: 'invite info',
        data: {
          newInvites: parseJson(newInvites?.reduce((acc, v, k) => ({ ...acc, [k]: { url: v.url, uses: v.uses } }), {})),
          oldInvites: parseJson(oldInvites?.reduce((acc, v, k) => ({ ...acc, [k]: { url: v.url, uses: v.uses } }), {})),
        },
      });
      throw new Error('Could not find a matching invite');
    }
    await cache_invites(helper, member.guild); // update the invites and their uses
    const client = await dbconnect();
    const query_result = await client.query('select role_id from invites where invite_id = $1', [invite.code]);
    let role_id: string | null = null;
    if (query_result.rowCount > 0) {
      console.log(parseJson(query_result.rows));
      role_id = query_result.rows[0]['role_id'];
    } else {
      Sentry.captureEvent({
        message: 'Invite role assignment skipped',
        level: 'info',
        tags: {
          invite_code: invite.code,
          guild_id: member.guild.id,
        },
        extra: {
          query_result: parseJson(query_result),
          member_id: member.id,
        },
        contexts: {
          invite: {
            code: invite.code,
            uses: invite.uses,
          },
          old_invite: {
            code: oldInvites.get(invite.code).code,
            uses: oldInvites.get(invite.code).uses,
          },
          guild: {
            id: member.guild.id,
            name: member.guild.name,
          },
        },
      });
      return;
    }
    const roles = await member.guild.roles.fetch();
    const new_role = roles.get(role_id);
    Sentry.addBreadcrumb({
      category: 'addRoleFromInvite',
      data: {
        query: `select role_id from invites where invite_id = '${invite.code}'`,
        role_id,
        new_role_id: new_role?.id ?? -1,
        typeof_roleid: typeof role_id,
        typeof_newroleid: typeof (new_role?.id ?? -1),
        roles: Array.from(roles.keys()),
      },
    });
    member.roles.add(new_role);
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
