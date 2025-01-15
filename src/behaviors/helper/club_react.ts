import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

// Define an interface for role mappings
interface IRoleMapping {
  emoji: string;
  roleId: string;
}

// Define your role mappings
const ROLE_MAPPINGS: IRoleMapping[] = [
  { emoji: '✅', roleId: 'YOUR_ROLE_ID_HERE' },
  // Add more mappings as needed
];

export async function addRole(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
): Promise<void> {
  // If the reaction is partial, fetch it
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the reaction:', error);
      return;
    }
  }

  // If the user is partial, fetch them
  if (user.partial) {
    try {
      await user.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the user:', error);
      return;
    }
  }

  // Check if the reaction is in a forum channel
  const message = reaction.message;
  const channel = message.channel;

  if (!channel.isThread()) {
    return; // Not a forum thread
  }

  // Find the matching role mapping
  const roleMapping = ROLE_MAPPINGS.find((mapping) => mapping.emoji === reaction.emoji.name);
  if (!roleMapping) {
    return; // No matching role for this emoji
  }

  // Get the guild member
  const member = message.guild?.members.cache.get(user.id);
  if (!member) {
    console.error('Could not find guild member');
    return;
  }

  // Add the role
  try {
    const role = message.guild?.roles.cache.get(roleMapping.roleId);
    if (!role) {
      console.error('Could not find role');
      return;
    }

    await member.roles.add(role);
    console.log(`Added role ${role.name} to user ${user.tag}`);
  } catch (error) {
    console.error('Error adding role:', error);
  }
}

// Add a MessageReactionRemove event handler to remove roles when reactions are removed
export async function rmRole(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
): Promise<void> {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the reaction:', error);
      return;
    }
  }

  if (user.partial) {
    try {
      await user.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the user:', error);
      return;
    }
  }

  const message = reaction.message;
  const channel = message.channel;

  if (!channel.isThread()) {
    return;
  }

  const roleMapping = ROLE_MAPPINGS.find((mapping) => mapping.emoji === reaction.emoji.name);
  if (!roleMapping) {
    return;
  }

  const member = message.guild?.members.cache.get(user.id);
  if (!member) {
    console.error('Could not find guild member');
    return;
  }

  // Remove the role
  try {
    const role = message.guild?.roles.cache.get(roleMapping.roleId);
    if (!role) {
      console.error('Could not find role');
      return;
    }

    await member.roles.remove(role);
    console.log(`Removed role ${role.name} from user ${user.tag}`);
  } catch (error) {
    console.error('Error removing role:', error);
  }
}
