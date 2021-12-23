import { assert } from 'console';
import { Role } from 'discord.js';
import { TransformationRule } from 'natural';
import { Command } from '../../types/Command';
import courseOverlaps, { getCourse } from '../../utils/helper/courseOverlaps';
import createChannels from '../../utils/helper/createChannels';

const command: Command = {
  name: '!enroll',
  description: 'Enroll in a class',
  async exec(msg, msgText) {
    let overlaps = false;
    const classes = msgText.split(',');
    const roles = await msg.guild?.roles.fetch();
    const member = msg.member;
    assert(roles && member);
    let skipped = await classes.reduce(async (s, c) => {
      // don't allow roles other than ece/cs roles to be added
      c = c.toLowerCase().replace(/\s*/g, '');
      if (c.split(/ece|cs|math/).length < 2) {
        s.then((a) => a.push(c));
        return s;
      }
      let role = roles!.find((r) => c === r.name.toLowerCase().replace(/\s*/g, ''));
      if (role) {
        await member!.roles.add(role);
      } else if (
        (overlaps = await courseOverlaps(c)) &&
        (role = roles!.find((r) => changeDepartment(c) === r.name.toLowerCase().replace(/\s*/g, '')))
      ) {
        await member!.roles.add(role);
      } else {
        if (overlaps) {
          s.then((a) => {
            a.push(`${c}/${changeDepartment(c)}`);
          });
        } else {
          s.then((a) => a.push(c));
        }
      }
      return s;
    }, Promise.resolve([] as string[]));

    if (skipped.length > 0) {
      // msg.channel.send(
      //   `${member?.user}: I was unable to find a channel associated with the following classes: ${skipped.join(
      //     ', ',
      //   )}. Please reach out to a moderator to get the channel added.`,
      // );

      skipped = skipped.filter(async (r) => {
        r = r.replace(/(ece|cs|math)/gi, (_, $1) => {
          return $1.toUpperCase() + ' ';
        });
        if (r.split(/ece|cs|math/i).length < 2) return true; // skipping dangerous roles
        return false;
      });
      const creatingRoles: Promise<Role>[] = await ((skipped.reduce as unknown) as any)(async (cr, r, i) => {
        const _r = r.split('/').map((__r) => getCourse(__r));
        const roleNames: string[] = [];
        for await (const temp of _r) {
          if (!temp) return cr;
          roleNames.push(temp.code.replace(/^([a-zA-Z]+)(\d+)$/, '$1 $2'));
        }
        for (let i = 0; i < roleNames.length; i++) {
          cr.push(
            (async () => {
              const role = await msg.guild?.roles.create({
                name: roleNames[i],
              });
              await member!.roles.add(role.id);
              return role;
            })(),
          );
          skipped.splice(i, 1);
          return cr;
        }
      }, ([] as unknown) as Promise<Role>[]);

      const creatingChannels = await createChannels(await Promise.all(creatingRoles), msg.guild ?? undefined);
      const newChannels = await Promise.all(creatingChannels);
      skipped.filter((r) => !newChannels.some((c) => r == c.toString().split('-').join(' ').replace(/\W/g, '')));
      if (skipped.length) {
        msg.channel.send(`${member} I was unable to find or create the following courses: ${skipped.join(',')}`);
      } else {
        msg.channel.send(`${member} You have been added to the requested courses`);
      }
      return true;
    }
  },
};

function changeDepartment(courseName: string) {
  return courseName.replace(/(ece|cs)/i, (_match, $1) => ($1?.toLowerCase() === 'ece' ? 'cs' : 'ece'));
}

export default command;
