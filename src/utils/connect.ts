import { Client, Intents } from 'discord.js';

export default function (key: symbol, cache: Map<symbol, Client>) {
  if (!key.description) return;
  const bot = new Client({ ws: { intents: Intents.ALL } });
  const token = process.env[key.description!];
  bot.login(token);
  cache.set(key, bot);
  return bot;
}
