import { Client, Message, TextChannel } from "discord.js";
import getTAs from '../../utils/ta/getTAs';

export default async function notifyTAs(message: Message, bot: Client) {
    const mentionRegxp = /<@[!&]?(\d+)>/g;
    const mentions = Array.from(message.content.matchAll(mentionRegxp)).map(
      (mention) =>
        bot.users.cache.get(mention[1]) ||
        message.guild!.roles.cache.get(mention[1])
    );
    if (!(mentions.length && mentions.some((user) => user && "username" in user &&  user.username === "TA")))
      return;
    const TAs = (await getTAs(bot, message.channel as TextChannel, true)).join(" ");
    message.channel.send(
      `${TAs} Student ${message.author} is asking for help: ${message.url}`
    );
  }