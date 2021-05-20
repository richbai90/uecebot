import { Message, TextChannel } from 'discord.js';
import { Command } from '../../types/Command';
import getTAs from '../../utils/ta/getTAs';
export const setup: Command<[Message, string]> = {
  name: '!setup',
  description: 'TA Setup Command',
  async exec(msg, _) {
    if ((await getTAs(msg.client, msg.channel as TextChannel, false)).length) {
      msg.channel.send('This channel has already been setup');
      return false;
    }
    const message = await msg.channel.send(
      'TAs: If you TA for this class and would like to be notified when people have questions please react with a thumbs up below',
    );
    message.react('👍');
    message.pin();
    return true;
  },
};
