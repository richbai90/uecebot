import { Client, Collection, Events, GatewayIntentBits as Intents, REST, Routes } from 'discord.js';
import { ICommand } from '../types/Command';
import * as enroll from '../commands/helper/enroll';

interface IBot extends Client<boolean> {
  commands: Collection<string, ICommand>;
}

export default function (key: symbol, cache: Map<symbol, Client>): IBot {
  if (!key.description) return;
  const bot = new Client({
    intents: [Intents.Guilds, Intents.GuildMessages, Intents.GuildMessageReactions, Intents.GuildMembers],
  }) as IBot;

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
  if (key.description === 'HELPER') {
    bot.commands.set('enroll', enroll);
  }

  cache.set(key, bot);
  return bot;
}
