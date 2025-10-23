// DEPRECATED: Discord bot runs on backend only
// See: server/discord-bot.ts

export const discordBotService = {
  initialize: async () => {
    console.warn("⚠️ Discord bot should run on backend. See server/discord-bot.ts");
  },
  disconnect: async () => {},
  isConnected: () => false,
};
