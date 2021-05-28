import { Message } from 'discord.js';
import AppSearchClient from '@elastic/app-search-node';
export default function saveMessage(message: Message, asClient: AppSearchClient): Promise<void>;
