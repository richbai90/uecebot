import { Client, TextChannel, User } from 'discord.js';

async function getTAs(bot: Client, channel: TextChannel, asString: boolean) {
  if (!bot.user) return [];
  const TAregexp = /^TAs:/;
  const pinned = await channel.messages.fetchPinned();
  const messagePromises = pinned.filter((msg) => TAregexp.test(msg.content)).map((msg) => msg.fetch(true));
  const messages = await Promise.all(messagePromises);
  await Promise.all(messages.map((msg) => msg.reactions.cache.map((r) => r.users.fetch())).flat());
  const finalValue = messages.flatMap((msg) =>
    msg.reactions.cache.map((r) => (asString ? r.users.cache.map((user) => user.toString()) : r.users.cache.values)),
  );
  return finalValue.flat().filter((user) => user.toString() !== bot.user!.toString());
}

export default getTAs as <T extends boolean>(
  bot: Client,
  channel: TextChannel,
  asString: T,
) => T extends true ? Promise<string[]> : Promise<User[]>;
