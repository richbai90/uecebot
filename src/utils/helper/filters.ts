import { Collection, Role, RoleManager } from 'discord.js';
import { not, isNil, propSatisfies, curry } from 'ramda';
import formatCourse from './formatCourse';
export const exists = (a: any): boolean => not(isNil(a));
export const classExists = curry((roles: Role[], c: string) =>
  roles.some((r) => propSatisfies((name: string) => c === formatCourse(name), 'name', r)),
);
export const courseIsRole = curry((roles: Collection<string, Role>, c: string) =>
  roles.find((r) => c === formatCourse(r.name)) ? c : null,
);

export const courseIsNotRole = curry((roles: Collection<string, Role>, c: string) =>
  roles.find((r) => c === formatCourse(r.name)) ? null : c,
);
