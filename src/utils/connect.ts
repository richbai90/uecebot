import { Client, Collection, Events, Guild, GatewayIntentBits as Intents, Invite, REST, Routes } from 'discord.js';
import { ICommand } from '../types/Command';
import * as enroll from '../commands/helper/enroll';
import * as drop from '../commands/helper/drop';
import * as invite from '../commands/helper/invite';
import * as Sentry from '@sentry/node';
import * as declare from '../commands/helper/declare';
import * as cleanup from '../commands/helper/cleanup';
import { wait } from '../utils/helpers';
//import * as help from '../commands/helper/help'; TODO: Add the commands and exports
interface IBot extends Client<boolean> {
  commands: Collection<string, ICommand>;
  invites?: Collection<string, Collection<string, Invite>>;
}

async function update_invite_collection(guild, bot) {
  const firstInvites = await guild.invites.fetch(); // collect all the existing invites
  bot.invites?.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, invite])));
  console.log(`Cached ${firstInvites.size} invites for guild: ${guild.id}`);
}

export async function cache_invites(bot: IBot, guild: Guild | null): Promise<void> {
  if (!('invites' in bot)) return;
  let promises: Promise<void>[] = [];
  if (!guild) {
    promises = bot.guilds.cache.map(async (guild) => update_invite_collection(guild, bot));
  } else {
    promises.push(update_invite_collection(guild, bot));
  }

  await Promise.all(promises);
}

export default function (key: symbol, cache: Map<symbol, Client>): IBot {
  if (!key.description) return;
  const bot = new Client({
    intents: [Intents.Guilds, Intents.GuildMessages, Intents.GuildMessageReactions, Intents.GuildMembers],
  }) as IBot;
  try {
    const token = process.env[key.description];
    bot.commands = new Collection();
    bot.invites = new Collection();
    bot.login(token);
    bot.once(Events.ClientReady, (c) => {
      // and deploy your commands!
      (async () => {
        await wait(1000); // wait 1s for setup to complete
        if (!bot.commands.size) return;
        try {
          console.log(`Started refreshing ${bot.commands.size} application (/) commands.`);

          // The put method is used to fully refresh all commands in the guild with the current set
          const data = await bot.rest.put(Routes.applicationCommands(bot.application.id), {
            body: Array.from(bot.commands.values()).map((c) => c.command.toJSON()),
          });

          console.log(`Successfully reloaded ${(data as any).length} application (/) commands.`);
        } catch (error) {
          // And of course, make sure you catch and log any errors!
          console.error(error);
        }
        try {
          await cache_invites(bot, null);
          console.log(`Successfully cached ${bot.invites?.size} invites`);
        } catch (error) {
          console.error(`failed to cached invites`);
          console.error(error);
        }
      })().then(() => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
      });
    });
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    if (key.description === 'HELPER') {
      bot.commands.set('enroll', enroll);
      bot.commands.set('drop', drop);
      bot.commands.set('declare', declare);
      bot.commands.set('cleanupsemester', cleanup);
      bot.commands.set('invite', invite);
      //bot.commands.set('help', help);
    }

    cache.set(key, bot);
    return bot;
  }
}
