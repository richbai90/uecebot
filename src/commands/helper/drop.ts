import { assert } from 'console';
import { Command } from '../../types/Command';

const command: Command = {
  name: '!drop',
  description: 'Enroll in a class',
  async exec(msg, msgText) {
    const classes = msgText.split(',');
    const roles = await (await msg.guild?.roles.fetch())?.cache;
    const member = msg.member;
    assert(roles && member);
    const skipped = await classes.reduce(async (s, c) => {
      if (c.toLowerCase().split(/ece|cs/).length < 2) {
        s.then((a) => a.push(c));
        return s;
      }
      const role = roles!.find((r) => c.toLowerCase().replace(/\s*/g, '') === r.name.toLowerCase().replace(/\s*/g, ''));
      if (role) {
        await member!.roles.remove(role);
      } else {
        s.then((a) => a.push(c));
      }
      return s;
    }, Promise.resolve([] as string[]));

    if (skipped.length > 0) {
      msg.channel.send(
        `<@${member?.user}>: I was unable to remove the following classes: ${skipped.join(
          ', ',
        )}. Please reach out to a moderator to get these channels removed.`,
      );
    } else {
      msg.channel.send(`<@${member?.user}>: You have been removed from the requested classes.`);
    }

    return true;
  },
};

export default command;
