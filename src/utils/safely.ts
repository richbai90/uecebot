import { AsyncFn } from '../types/UtilityTypes';

export default async function <T = void, A extends any[] = []>(fn: AsyncFn<T, A>, ...args: A): Promise<T> {
  try {
    return await fn(...args);
  } catch (err) {
    console.error(err);
    return null;
  }
}
