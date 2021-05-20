import { assert } from 'console';
import { Command } from '../../types/Command';

const command: Command = {
  name: '!cleanup_semester',
  description: 'Remove everyone from all roles',
  async exec(msg, msgText) {
    if (!msg.member?.roles.cache.find((r) => r.name === 'moderator')) return false;
    const testExpr = /^(?:(?:ece|cs|ece\/cs|cs\/ece)[\s-]+)/i;
    await Promise.all(
      msg.guild?.members.cache.map(async (m) => {
        return await Promise.all(
          m.roles.cache.map(async (r) => {
            if (testExpr.test(r.name)) {
              return await m.roles.remove(r);
            } else {
              return Promise.resolve();
            }
          }),
        );
      }) || [],
    );
    await Promise.all(
      msg.guild?.channels.cache.map(async (ch) => {
        if (testExpr.test(ch.name)) {
          await ch.clone();
          return await ch.delete('cleanup');
        } else {
          return Promise.resolve();
        }
      }) || [],
    );
    return true;
  },
};

export default command;
