import { assert } from 'console';
import { Collection, Role, TextChannel } from 'discord.js';
import formatCourse from '../../utils/helper/formatCourse';
import { Command } from '../../types/Command';
import courseOverlaps, { getCourse } from '../../utils/helper/courseOverlaps';
import createChannels from '../../utils/helper/createChannels';
import scrubRoleRequests from '../../utils/helper/scrubRoleRequests';
import { classExists, courseIsNotRole, courseIsRole, exists } from '../../utils/helper/filters';
import { userAdded } from '../../utils/helper/notifications';
import { difference } from 'ramda';
import addUserToRole from '../../utils/helper/addUserToRole';
import mergeArr from '../../utils/mergeArr';
import { classRoleDoesntExist, classRoleExists } from '../../utils/helper/classRoleExists';
import { createAndGrantNewRoles, grantExistingRoles } from '../../utils/helper/grantRoles';
import swap from '../../utils/swap';

const command: Command = {
  name: '!enroll',
  description: 'Enroll in a class',
  async exec(msg, msgText) {
    const classes = scrubRoleRequests(msgText.split(','));
    const roles = await msg.guild?.roles.fetch();
    const member = msg.member;
    const channel = msg.channel as TextChannel;
    assert(roles && member);

    // check for any roles that already exist
    let existingCourses = classRoleExists(classes, roles);
    let nonExistingCourses = classRoleDoesntExist(classes, roles);
    // check for any roles that existt as a different name
    existingCourses = await getExistingAndCrosslistedRoles(roles, existingCourses, nonExistingCourses);
    nonExistingCourses = difference(nonExistingCourses, existingCourses);
    // check for any roles that exist as a 57/67 difference
    const gradCourses = getGradCourses(nonExistingCourses);
    existingCourses = mergeArr(existingCourses, classRoleExists(gradCourses, roles));
    // do not overrwrite nonexisting courses incase the 5/6 difference doesn't exist
    let nonExistingGradCourses = swap(nonExistingCourses, gradCourses, (a, b) => make5767(a) === b);
    nonExistingCourses = difference(nonExistingCourses, existingCourses);
    // check for any roles that exist as a 57/67 difference under a different name
    existingCourses = await getExistingAndCrosslistedRoles(roles, existingCourses, nonExistingCourses);
    nonExistingGradCourses = difference(nonExistingGradCourses, existingCourses);

    if (nonExistingGradCourses.length) {
      existingCourses.filter((ec) => {
        return isGradCourse(ec) && nonExistingGradCourses.some(e => make5767(e) == ec)
      })
    } else {
      existingCourses.filter(ec => {
        return !isGradCourse(ec)
      })
    }

    const promises = [
      ...grantExistingRoles(member, existingCourses, roles),
      ...(await createAndGrantNewRoles(member, nonExistingCourses, msg.guild.roles)),
    ];

    const messages = (await Promise.all(promises)).map((role) =>
      channel.send(`${member}: You have been added to ${role?.name}`),
    );

    await Promise.all(messages);

    return true;

    //   let skipped = await classes.reduce(async (s, c) => {
    //     let role = roles!.find((r) => c === formatCourse(r.name));
    //     if (role) {
    //       await member!.roles.add(role);
    //     } else if (
    //       (overlaps = await courseOverlaps(c)) &&
    //       (role = roles!.find((r) => changeDepartment(c) === formatCourse(r.name)))
    //     ) {
    //       await member!.roles.add(role);
    //     } else if (is5767(c) && (role = roles.find((r) => formatCourse(r.name) === make5767(c)))) {
    //       await member!.roles.add(role);
    //     } else {
    //       if (overlaps) {
    //         s.then((a) => {
    //           a.push(`${c}/${changeDepartment(c)}`);
    //         });
    //       } else {
    //         s.then((a) => a.push(c));
    //       }
    //     }
    //     return s;
    //   }, Promise.resolve([] as string[]));

    //   if (skipped.length > 0) {
    //     // msg.channel.send(
    //     //   `${member?.user}: I was unable to find a channel associated with the following classes: ${skipped.join(
    //     //     ', ',
    //     //   )}. Please reach out to a moderator to get the channel added.`,
    //     // );

    //     skipped = skipped.filter(async (r) => {
    //       r = r.replace(/(ece|cs|math)/gi, (_, $1) => {
    //         return $1.toUpperCase() + ' ';
    //       });
    //       if (r.split(/ece|cs|math/i).length < 2) return false; // skipping dangerous roles
    //       return true;
    //     });
    //     const creatingRoles: Promise<Role>[] = await ((skipped.reduce as unknown) as any)(async (cr, r, i) => {
    //       const _r = r.split('/').map((__r) => getCourse(__r));
    //       const roleNames: string[] = [];
    //       for await (const temp of _r) {
    //         if (!temp) return cr;
    //         roleNames.push(temp.code.replace(/^([a-zA-Z]+)(\d+)$/, '$1 $2'));
    //       }
    //       for (let i = 0; i < roleNames.length; i++) {
    //         cr.push(
    //           (async () => {
    //             const role = await msg.guild?.roles.create({
    //               name: roleNames[i],
    //             });
    //             await member!.roles.add(role.id);
    //             return role;
    //           })(),
    //         );
    //         skipped.splice(i, 1);
    //         return cr;
    //       }
    //     }, ([] as unknown) as Promise<Role>[]);

    //     const creatingChannels = await createChannels(await Promise.all(creatingRoles), msg.guild ?? undefined);
    //     const newChannels = await Promise.all(creatingChannels);
    //     skipped.filter((r) => !newChannels.some((c) => r == c.toString().split('-').join(' ').replace(/\W/g, '')));
    //     if (skipped.length) {
    //       msg.channel.send(`${member} I was unable to find or create the following courses: ${skipped.join(',')}`);
    //     } else {
    //       msg.channel.send(`${member} You have been added to the requested courses`);
    //     }
    //     return true;
    //   }
    // },
  },
};

function changeDepartment(courseName: string) {
  return courseName.replace(/(ece|cs)/i, (_match, $1) => ($1?.toLowerCase() === 'ece' ? 'cs' : 'ece'));
}

function compareRoles(role1: Role, role2: Role) {
  return formatCourse(role1.name) === formatCourse(role2.name);
}

function isGradCourse(course: string) {
  return /^(?:ece|cs)(5|6)\d+/.test(course);
}

function make5767(course: string) {
  return course.replace(/([a-zA-Z]+)\s?(5|6)(\d+)/, (match, $1, $2, $3) => `${$1}${$2 == '5' ? `6${$3}` : `5${$3}`}`);
}

async function getExistingAndCrosslistedRoles(
  roles: Collection<string, Role>,
  existingCourses: string[],
  nonExistingCourses: string[],
) {
  const overlaps = nonExistingCourses.map((r) =>
    courseOverlaps(r).then((olap) => (olap ? formatCourse(changeDepartment(r)) : null)),
  );
  return mergeArr(
    existingCourses,
    (await Promise.all(overlaps)).filter(exists).map<string>(courseIsRole(roles)).filter(exists),
  );
}

function getGradCourses(roles: string[]): string[] {
  return roles.filter((r) => isGradCourse(formatCourse(r))).map((r) => make5767(r));
}

export default command;
