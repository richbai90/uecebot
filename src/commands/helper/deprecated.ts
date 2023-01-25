import { assert } from 'console';
import { Message, Role } from 'discord.js';
import { Command } from '../../types/Command';
import safely from '../../utils/safely';

const command: Command<[Message, string]> = {
  name: '!declare',
  description: 'declare a major',
  async exec(msg, msgText) {
    await msg.channel.send(
      `The command ${msgText} has been deprecated. If you received this message after using a ! command, try using a / command instead.`,
    );
    return false;
  },
};

export default command;
