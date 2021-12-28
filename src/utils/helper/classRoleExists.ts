import { Collection, Role } from 'discord.js';
import { courseIsNotRole, courseIsRole, exists } from './filters';

export const classRoleExists = (classes: string[], roles: Collection<string, Role>): string[] =>
  classes.map<string>(courseIsRole(roles)).filter(exists);

export const classRoleDoesntExist = (classes: string[], roles: Collection<string, Role>): string[] =>
  classes.map<string>(courseIsNotRole(roles)).filter(exists);
