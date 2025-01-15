import { AutocompleteInteraction, ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { AsyncFn } from './UtilityTypes';

export interface Command<E extends any[] = [Message, string]> { // eslint-disable-line
  name: string;
  description: string;
  exec: AsyncFn<boolean, E>;
}

export interface ICommand {
  command: Partial<SlashCommandBuilder>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
  autoComplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
