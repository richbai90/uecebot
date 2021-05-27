import { Client, Intents } from 'discord.js';
import AppSearchClient from '@elastic/app-search-node';

export default function (key: symbol, cache: Map<symbol, Client>) {
  if (!key.description) return;
  const bot = new Client({ ws: { intents: Intents.ALL } });
  const token = process.env[key.description!];
  bot.login(token);
  cache.set(key, bot);
  return bot;
}

export function asConnect(): AppSearchClient {
  return new AppSearchClient(undefined, process.env.ASAPI, () => process.env.ASEP!);
}
