import { Collection, GuildMember, Role, RoleManager } from 'discord.js';
import { stringify } from 'querystring';
import { getCourse } from './courseOverlaps';
import createChannels from './createChannels';
import { exists } from './filters';
import formatCourse from './formatCourse';

export const grantExistingRoles = (
  member: GuildMember,
  roles: string[] | Role[],
  roleCollection: Collection<string, Role>,
): Promise<Role>[] =>
  roles
    .map((name: string | Role) => {
      const r = roleCollection.find((role) => role === name || formatCourse(role.name) === name);
      if (!r) return null;
      return member.roles.add(r).then(() => r);
    })
    .filter(exists);

export const createAndGrantNewRoles = async (
  member: GuildMember,
  roles: string[],
  manager: RoleManager,
): Promise<Promise<Role>[]> => {
  const newRoles = roles.map((r) =>
    getCourse(r).then((c) =>
      c
        ? manager.create({ name: formatRole(r), mentionable: true, reason: `Requested by ${member.displayName}` })
        : null,
    ),
  );
  const promisedRoles = await Promise.all(newRoles);
  const grantedRoles = await Promise.all(grantExistingRoles(member, promisedRoles, manager.cache));
  await createChannels(grantedRoles, member.guild);
  return promisedRoles.map((r) => Promise.resolve(r));
};

function formatRole(roleName: string) {
  return roleName.replace(/([a-z]+)(\d+)/gi, (_, $1, $2) => $1.toUpperCase() + ` ${$2}`);
}
