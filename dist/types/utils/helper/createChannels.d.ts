import { Channel, Guild, Role } from 'discord.js';
export default function createChannels(roles: (Role | undefined)[], guild?: Guild): Promise<(Channel | undefined)[]>;
