import { addBreadcrumb, captureEvent, captureMessage, setContext } from '@sentry/node';
import {
  AutocompleteInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
  Message,
  PermissionsBitField,
  Role,
  SlashCommandBuilder,
} from 'discord.js';
import fetch from 'node-fetch';
import { IClass } from '../../types/IClass';

function searchKuali(query: string): IClass[] {
  // const response = await fetch(
  //   `https://utah.kuali.co/api/v1/catalog/search/619684b0ad08592661eff73a?q=${query.replace(/\s/g, '')}&limit=6`,
  // );
  return Array.from(global.CLASS_LIST);
}

export async function autoComplete(interaction: AutocompleteInteraction): Promise<void> {
  const query = interaction.options.getString('course');
  setContext('AUTOCOMPLETE', { query });
  if (query.length < 5) {
    await interaction.respond([{ name: 'Continue typing for auto suggestions...', value: '' }]);
    return;
  }
  const courseList = searchKuali(query);
  await interaction.respond(courseList.map((c) => ({ name: `${c.name}`, value: c.code })));
}

function isGradRole(roleName: string) {
  const roleNumber = parseInt(roleName.replace(/[^0-9]/g, ''));
  return roleNumber >= 5000;
}

// at this point we assume that the class wasn't found so we need to check edge cases
function checkEdgeCases(roleName: string, interaction: ChatInputCommandInteraction) {
  addBreadcrumb({
    level: 'info',
    data: {
      roleName,
    },
    message: 'Checking edge cases',
    type: 'message',
  });
  const roles = interaction.guild.roles.cache;
  // check if the role is cross listed
  const crossListed = searchKuali(roleName).reduce((pv, nv) => [...pv, ...nv.crossListed], []);
  const courseList = crossListed.map((course) =>
    roles.find((r, key, c) => r.name.toUpperCase() == course.split(' ').slice(0, -1).join(' ').toUpperCase()),
  );

  addBreadcrumb({
    level: 'info',
    data: {
      roleName,
      courseList,
      crossListed,
    },
    message: 'Returning Edge Case Results',
    type: 'message',
  });
  return courseList;
}

function normalizeRoleName(roleName: string) {
  const rx = /[^0-9](?=[0-9])/g;
  return roleName.replace(rx, ' ').toUpperCase();
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<Message<boolean>> {
  await interaction.deferReply();
  // Get autocomplete results for the course name
  const selectedCourse = interaction.options.get('course', true);
  const roleName = normalizeRoleName(selectedCourse.value.toString());
  if (!/^(?:ECE|CS) \d+$/.test(roleName)) {
    interaction.editReply(`you must select an option from the list provided by the enroll command`);
    return;
  }
  // Check if the role for the selected course already exists
  const role = interaction.guild?.roles.cache.find((r) => r.name === roleName);
  const memberRoles = interaction.member.roles as GuildMemberRoleManager;
  if (role) {
    // If the role already exists, add the user to it
    return memberRoles
      .add(role)
      .then(() => interaction.editReply(`You have been successfully enrolled in ${role.name}`));
  } else {
    const edgeCases = checkEdgeCases(selectedCourse.value.toString(), interaction);
    if (edgeCases.length) {
      return memberRoles
        .add(edgeCases[0])
        .then(() => interaction.editReply(`you have been successfully enrolled in ${edgeCases[0].name}`));
    }
    // It is useful to know if a role is being created as it may result in a bug if edge cases haven't been handled directly
    captureEvent({
      message: 'Creating Role',
      level: 'info',
    });
    // If the role does not exist, create it and add the user to it
    return interaction.guild?.roles
      .create({
        name: roleName,
        reason: `Enrolling user in ${roleName}`,
      })
      .then((createdRole) => {
        memberRoles.add(createdRole);
        interaction.guild.channels
          .create({
            name: normalizeRoleName(roleName),
            type: ChannelType.GuildText,
            // if the class is a 5k+ class put it in the >5k category else put it in the <5k category
            parent: parseInt(roleName.replace(/[^0-9]/g, '')) >= 5000 ? '1269062321028726877' : '786279356225028177',
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
              },
              {
                id: createdRole.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
              },
            ],
          })
          .catch((err) => {
            // if there was an error check if it was because we have reached the max number of channels
            if (/Maximum number of channels reached/.test(err.message)) {
              captureMessage('Maximum number of channels reached');
            }
            throw err; // for now we will just throw the error and let the user know that the class was not created
          });
        return createdRole;
      })
      .then((createdRole) => interaction.editReply(`You have been successfully enrolled in ${createdRole.name}`));
  }
}

export const command = new SlashCommandBuilder()
  .setName('enroll')
  .setDescription("Enroll in a course to get access to that course's channel")
  .addStringOption((opt) =>
    opt
      .setName('course')
      .setDescription('The name of the course you wish to enroll in')
      .setAutocomplete(true)
      .setRequired(true),
  );

declare global {
  var __rootdir__: string; // eslint-disable-line
  var CLASS_LIST: Set<IClass>; // eslint-disable-line
}
