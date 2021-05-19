import { assert } from 'console';
import { Command } from '../../types/Command';

const command: Command = {
  name: '!drop',
  description: 'Enroll in a class',
  async exec(msg, msgText) {
    const classes = msgText.split(' ');
    const roles = msg.guild?.roles.cache;
    const user = msg.member;
    assert(roles && user);
    const skipped = await classes.reduce(async (s, c) => {
      const role = roles!.find((r) => r.name.toLowerCase().trim().replace(' ', '-') === c.toLowerCase());
      if (role) {
        await user!.roles.remove(role);
      } else {
        s.then((a) => a.push(c));
      }
      return s;
    }, Promise.resolve([] as string[]));

    if (skipped.length > 0) {
      msg.channel.send(
        `${user}: I was unable to remove the following classes: ${skipped.join(
          ', ',
        )}. Please reach out to a moderator to get these channels removed.`,
      );
    } else {
      msg.channel.send(`${user}: You have been added to the requested classes.`);
    }

    return true;
  },
};

export default command;
