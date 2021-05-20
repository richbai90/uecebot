import { Message } from "discord.js";
import { AsyncFn } from "./UtilityTypes";
export interface Command<E extends any[] = [Message, string]> {
    name: string;
    description: string;
    exec: AsyncFn<boolean, E>;
}
