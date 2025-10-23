// api/index.ts
// Hono server on Vercel

import { Hono } from "hono";
import { cors } from "hono/cors";
import { Client, GatewayIntentBits, ChannelType } from "discord.js";

const app = new Hono();

// Middleware
app.use("*", cors());

// Initialize Discord client
let discordClient: Client | null = null;

async function getDiscordClient(): Promise<Client> {
  if (discordClient && discordClient.isReady()) {
    return discordClient;
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
    ],
  });

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN not set");
  }

  await discordClient.login(token);

  // Wait for ready
  return new Promise((resolve) => {
    discordClient!.once("ready", () => {
      console.log(`✅ Discord bot logged in as ${discordClient!.user?.tag}`);
      resolve(discordClient!);
    });
  });
}

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    bot: discordClient?.isReady() ? "connected" : "disconnected",
  });
});

// Send Discord notification
app.post("/api/discord/send-notification", async (c) => {
  try {
    const { embeds, components } = await c.req.json();
    const channelId = process.env.DISCORD_CHANNEL_ID;

    if (!channelId) {
      return c.json({ error: "Channel ID not configured" }, 400);
    }

    if (!embeds || !Array.isArray(embeds)) {
      return c.json({ error: "Invalid embeds" }, 400);
    }

    const client = await getDiscordClient();
    const channel = await client.channels.fetch(channelId);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return c.json({ error: "Invalid channel" }, 400);
    }

    await channel.send({
      embeds,
      components,
    });

    return c.json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return c.json(
      {
        error: "Failed to send notification",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Handle button interactions (optional - for future use)
app.post("/api/discord/interaction", async (c) => {
  try {
    const { customId, userId } = await c.req.json();

    console.log(`📌 Button clicked: ${customId} by ${userId}`);

    // Handle different button actions
    if (customId.startsWith("order_view_")) {
      const orderId = customId.replace("order_view_", "");
      return c.json({
        action: "view",
        orderId,
        url: `${process.env.VITE_APP_URL}/orders/${orderId}`,
      });
    }

    if (customId.startsWith("order_edit_")) {
      const orderId = customId.replace("order_edit_", "");
      return c.json({
        action: "edit",
        orderId,
        url: `${process.env.VITE_APP_URL}/orders/${orderId}/edit`,
      });
    }

    return c.json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("❌ Error handling interaction:", error);
    return c.json({ error: "Failed to handle interaction" }, 500);
  }
});

// Export for Vercel
export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;

export default app;
