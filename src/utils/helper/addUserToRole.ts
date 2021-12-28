import { GuildMember, Role, TextChannel } from 'discord.js';
import { curry } from 'ramda';
import { userAdded } from './notifications';

const addUserToRole = (member: GuildMember, r: Role) => member.roles.add(r).then(() => r);

export default curry(addUserToRole);
