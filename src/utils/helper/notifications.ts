import { Role, GuildMember, TextChannel } from 'discord.js';
import { curry } from 'ramda';
export const userAdded = curry((channel: TextChannel, member: GuildMember, role: Role) => {
  channel.send(`${member} you have been added to ${role.name}`);
});
