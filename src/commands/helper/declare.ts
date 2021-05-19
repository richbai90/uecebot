import { assert } from 'console';
import { Message, Role } from 'discord.js';
import { Command } from '../../types/Command';
import safely from '../../utils/safely';

const command: Command<[Message, string]> = {
  name: '!declare',
  description: 'declare a major',
  async exec(msg, msgText) {
    const user = msg.member;
    const EE = msg.guild?.roles.cache.find((r) => r.name.toLowerCase().trim() === 'ee');
    const CE = msg.guild?.roles.cache.find((r) => r.name.toLowerCase().trim() === 'ce');
    assert(user && EE && CE);
    if (msgText.toLowerCase() === 'ee') {
      const added = await safely(() => user!.roles.add(EE!));
      return !!added;
    } else if (msgText.toLowerCase() == 'ce') {
      const added = await safely(() => user!.roles.add(CE!));
      return !!added;
    } else {
      await safely(msg.channel.send, `Unknown major ${msgText}`, {});
    }
    return false;
  },
};

export default command;
