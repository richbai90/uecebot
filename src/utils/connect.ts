import { Client, Collection, Events, GatewayIntentBits as Intents, REST, Routes } from 'discord.js';
import { ICommand } from '../types/Command';
import * as enroll from '../commands/helper/enroll';
import * as drop from '../commands/helper/drop';
import * as Sentry from '@sentry/node';
import * as declare from '../commands/helper/declare';
import * as cleanup from '../commands/helper/cleanup';
//import * as help from '../commands/helper/help'; TODO: Add the commands and exports
interface IBot extends Client<boolean> {
  commands: Collection<string, ICommand>;
}

export default function (key: symbol, cache: Map<symbol, Client>): IBot {
  if (!key.description) return;
  const bot = new Client({
    intents: [Intents.Guilds, Intents.GuildMessages, Intents.GuildMessageReactions, Intents.GuildMembers],
  }) as IBot;
  try {
    const token = process.env[key.description];
    bot.login(token);
    bot.commands = new Collection();
    bot.once(Events.ClientReady, (c) => {
      // and deploy your commands!
      (async () => {
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
      //bot.commands.set('help', help);
    }

    cache.set(key, bot);
    return bot;
  }
}
