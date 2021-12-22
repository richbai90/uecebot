import { Client, Intents } from 'discord.js';

export default function (key: symbol, cache: Map<symbol, Client>) {
  if (!key.description) return;
  const bot = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  });
  const token = process.env[key.description!];
  bot.login(token);
  cache.set(key, bot);
  return bot;
}
