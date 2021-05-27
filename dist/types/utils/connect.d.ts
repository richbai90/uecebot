import { Client } from 'discord.js';
import AppSearchClient from '@elastic/app-search-node';
export default function (key: symbol, cache: Map<symbol, Client>): Client | undefined;
export declare function asConnect(): AppSearchClient;
