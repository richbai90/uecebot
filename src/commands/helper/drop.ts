import { assert } from 'console';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
  Message,
  SlashCommandBuilder,
} from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName('drop')
  .setDescription("drop a class you're enrolled in")
  .addStringOption((opt) =>
    opt
      .setName('course')
      .setDescription(
        'The name of the course(s) you wish to drop. Separate classes with a comma. If you want to drop all classes, use "all"',
      )
      .setAutocomplete(true)
      .setRequired(true),
  );

export async function autoComplete(interaction: AutocompleteInteraction): Promise<void> {
  const classes = await interaction.guild?.roles.fetch();
  assert(classes);
  const course = interaction.options.getString('course')?.toLowerCase();
  const courses = classes
    .filter((c) => c.name.toLowerCase().includes(course!))
    .map((c) => c.name)
    .sort();
  await interaction.respond(courses.map((c) => ({ name: c, value: c })));
}

export async function execexecute(interaction: ChatInputCommandInteraction): Promise<Message<boolean>> {
  await interaction.deferReply();
  const classes = interaction.options.get('course', true).value.toString().split(/,\s*/);
  const roles = await interaction.guild?.roles.fetch();
  const member = interaction.member;
  assert(roles && member);
  const skipped = await classes.reduce(async (s, c) => {
    if (c.toLowerCase().split(/ece|cs/).length < 2) {
      s.then((a) => a.push(c));
      return s;
    }
    const role = roles!.find((r) => c.toLowerCase().replace(/\s*/g, '') === r.name.toLowerCase().replace(/\s*/g, ''));
    if (role) {
      await ((member!.roles as unknown) as GuildMemberRoleManager).remove(role);
    } else {
      s.then((a) => a.push(c));
    }
    return s;
  }, Promise.resolve([] as string[]));

  if (skipped.length > 0) {
    return interaction.editReply(
      `${member?.user}: I was unable to remove the following classes: ${skipped.join(
        ', ',
      )}. Please reach out to a moderator to get these channels removed.`,
    );
  }
  return interaction.editReply(`<@${member?.user}>: You have been removed from the requested classes.`);
}
