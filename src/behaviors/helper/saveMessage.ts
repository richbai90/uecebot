import { Message, TextChannel } from 'discord.js';
import AppSearchClient from '@elastic/app-search-node';
import { DateTime } from 'luxon';
const engineName = 'ieee-discord';
import { TfIdf, WordTokenizer } from 'natural';

const tokenizer = new WordTokenizer();

export default async function saveMessage(message: Message, asClient: AppSearchClient): Promise<void> {
  try {
    message = await message.fetch();
    const doc = {
      text: message.content,
      ['author_username']: message.author.username,
      ['author_avatar']: message.author.avatarURL(),
      ['author_id']: message.author.id,
      ['author_tag']: message.author.tag,
      channel: (message.channel as TextChannel).name,
      created: DateTime.fromMillis(message.createdTimestamp).toISO(),
      url: message.url,
      tags: await genTags(message.content),
    };
    asClient.indexDocument(engineName, doc);
  } catch (err) {
    console.warn(err);
  }
}

async function genTags(msg: string) {
  const tfidf = new TfIdf();
  tfidf.addDocument(msg);
  const tokens = tokenizer.tokenize(msg);
  return (
    await Promise.all(
      tokens.map(
        (t, i) => new Promise<{ i: number; m: number }>((r) => tfidf.tfidfs(t, (_, m) => r({ i, m }))),
      ),
    )
  )
    .sort((a, b) => b.m - a.m)
    .slice(0, 3)
    .map((o) => tokens[o.i]);
}
