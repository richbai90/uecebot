import { Client, TextChannel, User } from 'discord.js';
declare const _default: <T extends boolean>(bot: Client, channel: TextChannel, asString: T) => T extends true ? Promise<string[]> : Promise<User[]>;
export default _default;
