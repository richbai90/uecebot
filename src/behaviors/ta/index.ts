import { Client, Message } from 'discord.js';

import {default as highlight} from './highlight';
import {default as notify} from './notify';
export default async function execBehaviors(bot: Client, msg: Message) {
    await highlight(msg, bot);
    await notify(msg, bot);
}