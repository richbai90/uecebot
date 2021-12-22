import { AsyncFn } from '../types/UtilityTypes';
export default function <T = void, A extends any[] = []>(fn: AsyncFn<T, A>, ...args: A): Promise<T>;
