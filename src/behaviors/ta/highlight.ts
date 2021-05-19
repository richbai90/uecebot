import { Client, Collection, Message, TextChannel } from 'discord.js'
import getTAs from '../../utils/ta/getTAs'

export default async function highlightTAContent(message: Message, bot: Client) {
  const emoji = bot.emojis.cache.findKey(e => e.name === 'mario')
  const TAs = await getTAs(bot, message.channel as TextChannel, false)
  let lastM: Collection<string, Message> | Message
  if (TAs.some(ta => ta.id === message.author.id)) {
    lastM = await message.channel.messages.fetch({
      limit: 2
    })
    if (lastM.size < 2) return
    lastM = await lastM.first(2)[1].fetch(true)

    if (lastM.author.id === message.author.id) {
      const lastE = lastM.reactions.cache.get(emoji!)
      if (lastE) lastE.remove()
    }

    message.react(emoji!)
  }
}
