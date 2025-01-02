import { AsyncFn } from '../types/UtilityTypes';

export function parseJson(o: unknown): Record<string, string> {
  return JSON.parse(
    JSON.stringify(
      o,
      (_, v) => (typeof v === 'bigint' ? v.toString() : v), // return everything else unchanged
    ),
  );
}

export default async function <T = void, A extends any[] = []>(fn: AsyncFn<T, A>, ...args: A): Promise<T> {
  try {
    return await fn(...args);
  } catch (err) {
    console.error(err);
    return null;
  }
}
