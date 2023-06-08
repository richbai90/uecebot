import { Client, Message } from 'discord.js';
import { Command } from '../types/Command';
import * as _commands from '../commands';

export default async function (msg: Message, client: Client) {
  let cmd: Command<[Message, string]>;
  const commands = client.user?.username.toLowerCase() === 'ta' ? _commands.ta : null;
  if (!commands) return false;
  const command = /^!(\w+)\s?((?:[a-zA-Z0-9-_,@# ]|,\s{1})*)$/.exec(msg.content);
  if ((command?.length ?? 0) < 3) return false;
  if ((cmd = ((commands as unknown) as { [key: string]: Command })[command![1]])) {
    return await cmd.exec(msg, command![2]);
  }
  return false;
}
