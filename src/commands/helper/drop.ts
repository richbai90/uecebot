import { assert } from 'console';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
  Message,
  SlashCommandBuilder,
} from 'discord.js';

// create a new slash command named "drop"
// this command will drop a class you're enrolled in
export const command = new SlashCommandBuilder()
  .setName('drop')
  .setDescription("drop a class you're enrolled in")
  // add a required string option named "course" and make it autocomplete
  .addStringOption((opt) =>
    opt
      .setName('course')
      .setDescription('The the course(s) you wish to drop. Comma separated.')
      .setAutocomplete(true)
      .setRequired(true),
  );

/**
 * The autocomplete function for the drop command
 * This will return a list of classes that match the input
 * @param interaction The interaction that triggered this command
 */
export async function autoComplete(interaction: AutocompleteInteraction): Promise<void> {
  // get the roles of the member that triggered this command
  const classes = ((await interaction.member?.roles) as GuildMemberRoleManager).cache;
  // make sure we have roles
  assert(classes);
  // get the course option from the interaction. This is the input from the user
  const course = interaction.options.getString('course')?.toLowerCase();
  // filter the classes (member roles) to only those that match the input
  const courses = classes
    .filter((c) => c.name.toLowerCase().includes(course) && c.name.toLowerCase().split(/ece|cs/).length > 1)
    .map((c) => c.name)
    .sort();
  // respond to the interaction with the list of classes
  await interaction.respond(courses.map((c) => ({ name: c, value: c })));
}
/**
 * The execute function for the drop command that handles the actual dropping of classes
 * At this point, we know that the user has entered valid classes
 * @param interaction The interaction that triggered this command
 * @returns Promise<Message<boolean>> A message that will be sent to the user
 */
export async function execute(interaction: ChatInputCommandInteraction): Promise<Message<boolean>> {
  // defer the reply so we can edit it later.
  // This is required for commands that take time to execute because discord imposes a 3 second response time limit for slash commands
  // The deferReply function tricks discord into thinking we've responded to the command, but we can still edit the response later
  await interaction.deferReply();
  // get the classes the user wants to drop (this is the input from the user that we validated in the autoComplete function)
  const classes = interaction.options.get('course', true).value.toString().split(/,\s*/);
  // get the roles of the member that triggered this command
  const roles = await interaction.guild?.roles.fetch();
  const member = interaction.member;
  // make sure we have roles and a member
  assert(roles && member);
  // make sure to skip roles that do not match the format of a class
  // this is to prevent the bot from removing roles that are not classes (e.g. @everyone, @moderator, @ta, etc.)
  const skipped = await classes.reduce(async (s, c) => {
    if (c.toLowerCase().split(/ece|cs/).length < 2) {
      s.then((a) => a.push(c));
      return s;
    }
    // find the role that matches the input from the user removing all whitespace and making it lowercase for comparison
    // this is to account for the fact that the user may have entered the class name with or without spaces
    // Also, the role name may have spaces or not
    const role = roles.find((r) => c.toLowerCase().replace(/\s*/g, '') === r.name.toLowerCase().replace(/\s*/g, ''));
    // if we found a role, remove it from the member
    if (role) {
      await ((member.roles as unknown) as GuildMemberRoleManager).remove(role);
    } else {
      // if we didn't find a role, add it to the skipped list
      s.then((a) => a.push(c));
    }
    return s;
  }, Promise.resolve([] as string[]));

  if (skipped.length > 0) {
    // if we skipped any classes, let the user know and tell them to reach out to a moderator to get the classes removed
    return interaction.editReply(
      `${member?.user}: I was unable to remove the following classes: ${skipped.join(
        ', ',
      )}. Please reach out to a moderator to get these channels removed.`,
    );
  }
  // if we didn't skip any classes, let the user know that they have been removed from the requested classes
  return interaction.editReply(`${member?.user}: You have been removed from the requested classes.`);
}
