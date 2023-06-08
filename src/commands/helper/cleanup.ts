import { assert } from 'console';
import {
  CommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
  PermissionFlagsBits,
  AutocompleteInteraction,
} from 'discord.js';

// Create a new slash command named "cleanupsemester"
export const command = new SlashCommandBuilder()
  .setName('cleanupsemester')
  .setDescription('Remove everyone from all roles. (Moderators only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator); // Restrict command usage to only those with the Administrator permission

/**
 * The execute function for the cleanupsemester command
 * @param interaction The interaction that triggered this command
 * @returns Promise<void>
 */
export async function execute(interaction: CommandInteraction): Promise<boolean> {
  // Ensure the user executing the command is a moderator
  const member = interaction.member;
  assert(member);
  if (!(member.permissions as Readonly<PermissionsBitField>).has(PermissionFlagsBits.ManageRoles)) {
    // Assuming 'moderator' role has 'MANAGE_ROLES' permission
    await interaction.reply('You do not have the permissions to use this command.');
    return;
  }

  // Defer the reply so we can edit it later
  await interaction.deferReply();

  // Define the regular expression for the class roles
  const testExpr = /^(?:(?:math|ece|cs|ece\/cs|cs\/ece)[\s-]+)/i;

  // Fetch all guild members
  const members = await interaction.guild?.members.fetch();
  assert(members);

  // Iterate through each member
  members.forEach((member) => {
    // Iterate through each role of the member
    member.roles.cache.forEach(async (role) => {
      // Remove the role if it matches the regular expression for class roles
      if (testExpr.test(role.name)) {
        await member.roles.remove(role);
      }
    });
  });

  // Inform the command user that all class roles have been removed
  await interaction.editReply('All class roles have been removed from all users.');
}

export async function autoComplete(_: AutocompleteInteraction): Promise<void> {
  // This command does not have any autocomplete options
  return;
}
