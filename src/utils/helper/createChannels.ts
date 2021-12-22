import { Channel, Guild, Role } from 'discord.js';

export default async function createChannels(
  roles: (Role | undefined)[],
  guild?: Guild,
): Promise<(Channel | undefined)[]> {
  const channels = roles.map((role) =>
    (async () => {
      if (!role || !guild) return Promise.resolve(undefined);
      let parent;
      if (role.name.match(/ece/i)) {
        parent = '786279356225028177';
      } else if (role.name.match(/cs/i)) {
        parent = '786279763475562547';
      } else {
        parent = '786280014382497832';
      }
      const channel = await guild.channels.create(role.name.replace(/\s*|\/*/g, '-'), {
        type: 'GUILD_TEXT',
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: role.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
        ],
        parent,
      });
      return channel;
    })(),
  );
  return await Promise.all(channels);
}
