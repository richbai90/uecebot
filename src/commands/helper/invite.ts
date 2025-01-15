import {
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  Message,
  PermissionFlagsBits,
  Role,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { IClass } from '../../types/IClass';
import { Client } from 'pg';
import { connect } from '../../utils/db';

export const command = new SlashCommandBuilder()
  .setName('invite')
  .setDescription('Create an invite with a specific role')
  .setDefaultMemberPermissions(PermissionFlagsBits.CreateInstantInvite & PermissionFlagsBits.ManageRoles) // don't allow the bot to skirt permissions
  .addRoleOption((option) =>
    option.setName('role').setDescription('Select a role to add with this invite').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<Message<boolean>> {
  await interaction.deferReply(); // Defer the reply until the execution is complete
  if (!global.DBAVAIL) {
    await interaction.editReply('The role database is currently unavailable. Contact an admin for support.');
    throw new Error('The database is currently unavailable.');
  }
  const role = interaction.options.getRole('role', true);
  try {
    validateRoleAssignment(interaction.member as GuildMember, role as Role, interaction.guild);
  } catch (err) {
    await interaction.editReply(err.message);
    throw err;
  }
  const channel = await interaction.client.channels.fetch(interaction.channelId);
  if (!channel.isTextBased) {
    await interaction.editReply('You cannot create an invite for a non-text channel.');
    throw new Error('Attempted to create an invite for non-text channel');
  }

  const invite = await (channel as TextChannel).createInvite({
    maxAge: 0,
    unique: true,
  });

  const client = await connect();
  try {
    await client.query(`insert into invites (invite_id, role_id) VALUES ($1, $2)`, [invite.url, role.id]);
    return interaction.editReply(`Invite created: '${invite.url}'`);
  } catch (err) {
    await interaction.editReply(`Failed to store the invite for tracking. Contact an admin for support.`);
    throw err;
  } finally {
    await client.end();
  }
}

function validateRoleAssignment(member: GuildMember, role: Role, guild: Guild): void {
  if (member.roles.highest.comparePositionTo(role) < 0) {
    throw new Error('User privilege level < selected role.');
  }

  // Check if it's a special role (like @everyone)
  if (role.id === guild.id) {
    throw new Error('Cannot create invites for the @everyone role.');
  }

  // Check if it's an integrated role (like a bot role)
  if (role.managed) {
    throw new Error('Cannot create invites for integrated roles.');
  }

  // Check if the role has dangerous permissions
  const dangerousPermissions = [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageWebhooks,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.KickMembers,
  ];

  if (dangerousPermissions.some((perm) => role.permissions.has(perm))) {
    throw new Error('Cannot create invites for roles with sensitive permissions.');
  }
}

declare global {
  var __rootdir__: string; // eslint-disable-line
  var CLASS_LIST: Set<IClass>; // eslint-disable-line
  var DBAVAIL: boolean; // eslint-disable-line
}
