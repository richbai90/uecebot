import { setContext } from '@sentry/node';
import {
  AutocompleteInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  Guild,
  GuildMemberRoleManager,
  Message,
  PermissionsBitField,
  Role,
  RoleManager,
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
    `https://utah.kuali.co/api/v1/catalog/search/619684b0ad08592661eff73a?q=${query}&limit=6`,
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
  const response = await fetch(`https://utah.kuali.co/api/v1/catalog/course/6000afce403c68001bca5f0b/${pid}`);
  if (response.ok) {
    const data = await response.json();
    return [data]
  }
  throw new Error(response.statusText);
}

export async function autoComplete(interaction: AutocompleteInteraction): Promise<void> {
  const query = interaction.options.getString('course').replace(/\s/g, '');
  setContext('AUTOCOMPLETE', { query });
  if (query.length < 4) {
    await interaction.respond([{ name: 'Continue typing for auto suggestions...', value: '' }]);
    return;
  }
  const courseList = await searchKuali(query);
  await interaction.respond(courseList.map((c) => ({ name: `${c.code}: ${c.title}`, value: c.code })));
}

// at this point we assume that the class wasn't found so we need to check edge cases
async function checkEdgeCases(roleName: string, interaction: ChatInputCommandInteraction) {
  let results57: ICourse[] = [];
  const courseList: Role[] = [];
  const roles = interaction.guild.roles.cache;
  if (/(5|6)7/.test(roleName)) {
    results57 = (
      await Promise.all([searchKuali(roleName.replace('57', '67')), searchKuali(roleName.replace('67', '57'))])
    ).flat();
  }
  for (const result of results57) {
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

  return courseList;
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<Message<boolean>> {
  await interaction.deferReply();
  // Get autocomplete results for the course name
  const selectedCourse = interaction.options.get('course', true);
  const roleName = selectedCourse.value.toString();
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
    // If the role does not exist, create it and add the user to it
    return interaction.guild?.roles
      .create({
        name: roleName,
        reason: `Enrolling user in ${roleName}`,
      })
      .then((createdRole) => {
        memberRoles.add(createdRole);
        interaction.guild.channels.create({
          name: roleName,
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
