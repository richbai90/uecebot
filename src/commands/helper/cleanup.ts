import { Command } from '../../types/Command';

const command: Command = {
  name: '!cleanup',
  description: 'Remove everyone from all roles',
  async exec(msg, msgText) {
    if (!msg.member?.roles.resolve('moderator')) return false;
    const roles = await (await msg.guild?.roles.fetch())?.cache;
    assert(roles);
    const testExpr = /ece|cs|ece\/cs|cs\/ece\s+/i;
    roles
      ?.filter((r) => testExpr.test(r.name))
      .forEach((r) => {
        r.members.forEach((m) => m.roles.remove(r));
      });
    return true;
  },
};

export default command;
