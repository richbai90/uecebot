import { Message } from "discord.js";
import { Command } from "../types/Command";
import * as commands from '../commands';

export default async function (msg : Message) {
    let cmd : Command<[Message, string]>;
    const command = (/^!(\w+)/).exec(msg.content);
    if (command?.length ?? 0 < 1) return false;
    if((cmd = (commands as unknown as {[key: string] : Command})[command![1]])) {
        return await cmd.exec(msg, command![1]);
    }
    return false;
  }