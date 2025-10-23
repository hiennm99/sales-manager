// server/discord-bot.ts

import { Client, GatewayIntentBits, Events, ButtonInteraction, ChannelType } from "discord.js";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load environment variables
dotenv.config({ path: ".env" });

class DiscordBotServer {
  private client: Client;
  private isReady = false;
  private app: express.Application;
  private channelId: string | null = null;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.app = express();
    this.setupExpressServer();
    this.setupEventHandlers();
  }

  /**
   * Setup Express server for API
   */
  private setupExpressServer(): void {
    this.app.use(cors());
    this.app.use(express.json());

    // Send notification endpoint
    this.app.post("/api/discord/send-notification", async (req, res) => {
      try {
        const { embeds, components, payload } = req.body;
        const channelId = process.env.VITE_DISCORD_CHANNEL_ID;

        if (!channelId) {
          return res.status(400).json({ error: "Channel ID not configured" });
        }

        const channel = await this.client.channels.fetch(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
          return res.status(400).json({ error: "Invalid channel" });
        }

        await channel.send({
          embeds,
          components,
        });

        res.json({ success: true, message: "Notification sent" });
      } catch (error) {
        console.error("❌ Error sending notification:", error);
        res.status(500).json({ error: "Failed to send notification" });
      }
    });

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok", bot: this.isReady ? "connected" : "disconnected" });
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Ready event
    this.client.once(Events.ClientReady, () => {
      console.log(`✅ Discord bot logged in as ${this.client.user?.tag}`);
      this.isReady = true;

      // Start Express server
      const port = process.env.DISCORD_BOT_PORT || 3000;
      this.app.listen(port, () => {
        console.log(`🚀 Discord bot API listening on port ${port}`);
      });
    });

    // Interaction event
    this.client.on(Events.InteractionCreate, async (interaction) => {
      await this.handleInteraction(interaction);
    });

    // Error handling
    this.client.on("error", (error) => {
      console.error("❌ Discord client error:", error);
    });

    process.on("unhandledRejection", (error) => {
      console.error("❌ Unhandled rejection:", error);
    });
  }

  /**
   * Handle button interactions
   */
  private async handleInteraction(interaction: any): Promise<void> {
    if (!interaction.isButton()) return;

    try {
      const customId = interaction.customId;
      console.log(`📌 Button clicked: ${customId}`);

      // Order view button
      if (customId.startsWith("order_view_")) {
        const orderId = customId.replace("order_view_", "");
        await this.handleOrderView(interaction, orderId);
      }

      // Order edit button
      if (customId.startsWith("order_edit_")) {
        const orderId = customId.replace("order_edit_", "");
        await this.handleOrderEdit(interaction, orderId);
      }
    } catch (error) {
      console.error("❌ Error handling interaction:", error);
      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Có lỗi xảy ra. Vui lòng thử lại.",
          ephemeral: true,
        }).catch((err) => console.error("Failed to reply:", err));
      }
    }
  }

  /**
   * Handle order view button click
   */
  private async handleOrderView(
    interaction: ButtonInteraction,
    orderId: string,
  ): Promise<void> {
    const appUrl = process.env.VITE_APP_URL || "http://localhost:5173";
    const orderUrl = `${appUrl}/orders/${orderId}`;

    await interaction.reply({
      content: `🔍 **Xem Chi Tiết Đơn Hàng**\n\n[Mở Đơn Hàng #${orderId}](${orderUrl})`,
      ephemeral: true,
    });
  }

  /**
   * Handle order edit button click
   */
  private async handleOrderEdit(
    interaction: ButtonInteraction,
    orderId: string,
  ): Promise<void> {
    const appUrl = process.env.VITE_APP_URL || "http://localhost:5173";
    const editUrl = `${appUrl}/orders/${orderId}/edit`;

    await interaction.reply({
      content: `✍️ **Chỉnh Sửa Đơn Hàng**\n\n[Chỉnh Sửa Đơn Hàng #${orderId}](${editUrl})`,
      ephemeral: true,
    });
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    const botToken = process.env.VITE_DISCORD_BOT_TOKEN;
    const channelId = process.env.VITE_DISCORD_CHANNEL_ID;

    if (!botToken) {
      console.error("❌ VITE_DISCORD_BOT_TOKEN not set in .env.local");
      process.exit(1);
    }

    if (!channelId) {
      console.error("❌ VITE_DISCORD_CHANNEL_ID not set in .env.local");
      process.exit(1);
    }

    try {
      console.log("🚀 Starting Discord bot...");
      await this.client.login(botToken);
    } catch (error) {
      console.error("❌ Failed to start Discord bot:", error);
      process.exit(1);
    }
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      console.log("✅ Discord bot stopped");
    }
  }

  /**
   * Check if bot is ready
   */
  isConnected(): boolean {
    return this.isReady && this.client !== null;
  }
}

// Main execution
const bot = new DiscordBotServer();

bot.start().catch((error) => {
  console.error("Failed to start bot:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n📌 Shutting down...");
  await bot.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n📌 Shutting down...");
  await bot.stop();
  process.exit(0);
});

export default bot;
