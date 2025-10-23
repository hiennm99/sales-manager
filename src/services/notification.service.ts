// services/notification.service.ts

export interface NotificationPayload {
  type: "order_created" | "order_updated" | "order_status_changed";
  title: string;
  description: string;
  orderId?: number;
  orderCode?: string;
  data?: Record<string, unknown>;
}

export interface NotificationConfig {
  discord_webhook_url?: string;
  telegram_chat_id?: string;
  telegram_token?: string;
}

class NotificationService {
  /**
   * Send notification to Discord via Bot (for button support)
   */
  async sendDiscordNotification(
    webhookUrl: string,
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      const typeLabel = this.getTypeLabel(payload.type);

      // Build embed fields
      const fields = [
        {
          name: "🆔 Order ID",
          value: payload.orderId?.toString() || "N/A",
          inline: true,
        },
        {
          name: "📦 Order Code",
          value: payload.orderCode || "N/A",
          inline: true,
        },
        {
          name: "📋 Loại",
          value: typeLabel,
          inline: true,
        },
      ];

      if (payload.data?.customer) {
        fields.push({
          name: "👤 Khách hàng",
          value: payload.data.customer.toString(),
          inline: false,
        });
      }

      if (payload.data?.amount) {
        fields.push({
          name: "💰 Số tiền",
          value: `${Number(payload.data.amount).toLocaleString("vi-VN")} VNĐ`,
          inline: false,
        });
      }

      if (Array.isArray(payload.data?.changes) && payload.data.changes.length > 0) {
        const changesText = (payload.data.changes as string[]).join("\n");
        fields.push({
          name: "🔄 Thay đổi",
          value: changesText || "Không có thay đổi",
          inline: false,
        });
      }

      // Create embed object
      const embed = {
        title: payload.title,
        description: payload.description,
        color: this.getColorByType(payload.type),
        fields,
        footer: {
          text: "Sales Manager",
          icon_url: "https://img.icons8.com/color/96/000000/sales.png",
        },
        timestamp: new Date().toISOString(),
      };

      // Create buttons
      const components = [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: "🔍 Xem Chi Tiết",
              custom_id: `order_view_${payload.orderId}`,
            },
            {
              type: 2,
              style: 2,
              label: "✍️ Chỉnh Sửa",
              custom_id: `order_edit_${payload.orderId}`,
            },
          ],
        },
      ];

      // Send to bot API instead of webhook for button support
      const botApiUrl = import.meta.env.VITE_DISCORD_BOT_API_URL || "http://localhost:3000";
      const response = await fetch(`${botApiUrl}/api/discord/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
          components,
          payload,
        }),
      }).catch(() => {
        // Fallback to webhook if bot API is not available
        console.warn("⚠️ Bot API not available, falling back to webhook");
        return fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embeds: [embed],
            components,
          }),
        });
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.statusText}`);
      }

      console.log("✅ Discord notification sent");
    } catch (error) {
      console.error("❌ Failed to send Discord notification:", error);
      throw error;
    }
  }

  /**
   * Send notification to Telegram via Bot API
   */
  async sendTelegramNotification(
    botToken: string,
    chatId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      const typeLabel = this.getTypeLabel(payload.type);
      let message = `${payload.title}\n\n${payload.description}\n`;
      message += `\n🆔 *Order ID:* ${payload.orderId || "N/A"}\n`;
      message += `📦 *Order Code:* ${payload.orderCode || "N/A"}\n`;
      message += `📋 *Loại:* ${typeLabel}\n`;

      if (payload.data?.customer) {
        message += `👤 *Khách hàng:* ${payload.data.customer}\n`;
      }

      if (payload.data?.amount) {
        message += `💰 *Số tiền:* ${Number(payload.data.amount).toLocaleString("vi-VN")} VNĐ\n`;
      }

      if (Array.isArray(payload.data?.changes) && payload.data.changes.length > 0) {
        message += `\n🔄 *Thay đổi:*\n`;
        (payload.data.changes as string[]).forEach((change) => {
          message += `  • ${change}\n`;
        });
      }

      message += `\n⏰ *Thời gian:* ${new Date().toLocaleString("vi-VN")}`;

      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Telegram API failed: ${response.statusText}`);
      }

      console.log("✅ Telegram notification sent");
    } catch (error) {
      console.error("❌ Failed to send Telegram notification:", error);
      throw error;
    }
  }

  /**
   * Get notification config from environment variables
   */
  private getConfig(): NotificationConfig {
    return {
      discord_webhook_url: import.meta.env.VITE_DISCORD_WEBHOOK_URL,
      telegram_chat_id: import.meta.env.VITE_TELEGRAM_CHAT_ID,
      telegram_token: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
    };
  }

  /**
   * Send notification using environment config
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      const config = this.getConfig();

      // Send Discord notification
      if (config.discord_webhook_url) {
        await this.sendDiscordNotification(
          config.discord_webhook_url,
          payload,
        );
      }

      // Send Telegram notification
      if (config.telegram_chat_id && config.telegram_token) {
        await this.sendTelegramNotification(
          config.telegram_token,
          config.telegram_chat_id,
          payload,
        );
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw error;
    }
  }

  /**
   * Get color by notification type for Discord embed
   */
  private getColorByType(type: NotificationPayload["type"]): number {
    switch (type) {
      case "order_created":
        return 0x00ff00; // Green
      case "order_updated":
        return 0xffff00; // Yellow
      case "order_status_changed":
        return 0x0099ff; // Blue
      default:
        return 0x808080; // Gray
    }
  }

  /**
   * Get human-readable label for notification type
   */
  private getTypeLabel(type: NotificationPayload["type"]): string {
    switch (type) {
      case "order_created":
        return "Đơn hàng mới";
      case "order_updated":
        return "Đơn hàng được cập nhật";
      case "order_status_changed":
        return "Trạng thái thay đổi";
    }
  }
}

export const notificationService = new NotificationService();
