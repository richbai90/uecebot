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

interface ICourse {
  id: string;
  pid: string;
  title: string;
  description: string;
  code: string;
  subjectCode: {
    id: string;
    name: string;
    description: string;
    linkedGroup: string;
  };
  number: string;
  type: string;
}

interface ICourseDetails extends ICourse {
  jointlyOffered?: [
    {
      __catalogCourseId: string;
      pid: string;
      title: string;
    },
  ];
  designationDescription?: string;
  __passedCatalogQuery?: boolean;
  courseRules?: string;
  component?: [
    {
      name: string;
      id: string;
    },
  ];
  credits?: {
    credits: {
      min: string;
      max: string;
    };
    value: string;
    chosen: string;
  };
  dateStart?: string;
  catalogActivationDate?: string;
  _score?: number;
}

async function searchKuali(query: string): Promise<ICourse[]> {
  const response = await fetch(
    `https://utah.kuali.co/api/v1/catalog/search/619684b0ad08592661eff73a?q=${query.replace(/\s/g, '')}&limit=6`,
  );
  if (response.ok) {
    const data = await response.json();
    return data
      .filter((c: any) => c.subjectCode.name.toUpperCase() === 'CS' || c.subjectCode.name.toUpperCase() === 'ECE')
      .map((c: any) => ({ ...c, code: c.code.replace(/([A-Z])(\d)/, '$1 $2') }));
  }
  throw new Error(response.statusText);
}

async function kualiLookup(pid: string): Promise<ICourseDetails[]> {
  const response = await fetch(
    `https://utah.kuali.co/api/v1/catalog/course/6000afce403c68001bca5f0b/${pid.replace(/\s/g, '')}`,
  );
  if (response.ok) {
    const data = await response.json();
    return [data];
  }
  throw new Error(response.statusText);
}

export async function autoComplete(interaction: AutocompleteInteraction): Promise<void> {
  const query = interaction.options.getString('course');
  setContext('AUTOCOMPLETE', { query });
  if (query.length < 5) {
    await interaction.respond([{ name: 'Continue typing for auto suggestions...', value: '' }]);
    return;
  }
  const courseList = await searchKuali(query);
  await interaction.respond(courseList.map((c) => ({ name: `${c.code}: ${c.title}`, value: c.code })));
}

// at this point we assume that the class wasn't found so we need to check edge cases
async function checkEdgeCases(roleName: string, interaction: ChatInputCommandInteraction) {
  addBreadcrumb({
    level: 'info',
    data: {
      roleName,
    },
    message: 'Checking edge cases',
    type: 'message',
  });
  let permutations: ICourse[] = [];
  const courseList: Role[] = [];
  const roles = interaction.guild.roles.cache;
  // search all permutations of the course
  let gradRole: string;
  if (/\s5/.test(roleName)) {
    gradRole = roleName.replace(/\s5/, '6');
  } else if (/\s6/.test(roleName)) {
    gradRole = roleName.replace(/\s6/, '5');
  }
  if (gradRole) {
    permutations = await searchKuali(gradRole);
    for (const result of permutations) {
      if (result.title.toLowerCase() === roleName.toLowerCase()) {
        // Check if the grad course has a corresponding role
        if (roles.find((r) => r.name.toLowerCase() === result.title.toLowerCase())) {
          courseList.push(roles.find((r) => r.name.toLowerCase() === result.title.toLowerCase()));
        }
      }
    }

    const crossListed = await kualiLookup((await searchKuali(roleName))[0].pid);
    if (
      crossListed.length &&
      crossListed[0].jointlyOffered &&
      crossListed[0].jointlyOffered[0].title == roleName &&
      roles.find((r) => r.name.toLowerCase() == crossListed[0].jointlyOffered[0].title.toLowerCase())
    ) {
      courseList.push(roles.find((r) => r.name.toLowerCase() == crossListed[0].jointlyOffered[0].title.toLowerCase()));
    }

    addBreadcrumb({
      level: 'info',
      data: {
        roleName,
        results57: permutations,
        courseList,
        crossListed,
      },
      message: 'Returning Edge Case Results',
      type: 'message',
    });
  }

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
    const edgeCases = await checkEdgeCases(selectedCourse.value.toString(), interaction);
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
        interaction.guild.channels.create({
          name: normalizeRoleName(roleName),
          type: ChannelType.GuildText,
          // if the class is a 5k+ class put it in the >5k category else put it in the <5k category
          parent: parseInt(roleName.replace(/[^0-9]/g, '')) > 5000 ? '936695108085096469' : '786279356225028177',
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
