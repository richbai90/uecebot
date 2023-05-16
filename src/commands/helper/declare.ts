import { assert } from 'console';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
  Message,
  Role,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../../types/Command';
import safely from '../../utils/safely';

export const command = new SlashCommandBuilder()
  .setName('declare')
  .setDescription('declare your major')
  .addStringOption((opt) => opt.setName('major').setDescription('your major').setAutocomplete(true).setRequired(true));

export async function autoComplete(interaction: AutocompleteInteraction): Promise<void> {
  await interaction.respond([
    { name: 'EE', value: 'EE' },
    { name: 'CE', value: 'CE' },
  ]);
}
export async function execute(interaction: ChatInputCommandInteraction): Promise<Message<boolean>> {
  await interaction.deferReply();
  const member = interaction.member;
  const roles = member.roles as GuildMemberRoleManager;
  const EE = interaction.guild?.roles.cache.find((r) => r.name.toLowerCase().trim() === 'ee');
  const CE = interaction.guild?.roles.cache.find((r) => r.name.toLowerCase().trim() === 'ce');
  const msgText = interaction.options.getString('major', true);
  let added = false;
  assert(member && EE && CE);
  if (msgText.toLowerCase() === 'ee') {
    added = !!(await safely(() => roles.add(EE)));
  } else if (msgText.toLowerCase() == 'ce') {
    added = !!(await safely(() => roles.add(CE)));
  } else {
    return interaction.editReply(`Unknown major ${msgText}`);
  }
  if (added) {
    return interaction.editReply(`${member.user}: You have been added to the requested major.`);
  }

  return interaction.editReply(`${member.user}: I was unable to add you to the requested major.`);
}
