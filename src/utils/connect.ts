import { Client } from "discord.js";

export default function(key: Symbol, cache: WeakMap<Symbol, Client>) {
    if(!key.description) return;
    const bot = new Client();
    const token = process.env[key.description!]
    bot.login(token);
    cache.set(key, bot);
    return bot;
}