// services/notificationService.ts

export interface NotificationPayload {
  type: "order_created" | "order_updated" | "order_status_changed";
  title: string;
  description: string;
  orderId?: number;
  orderCode?: string;
  data?: Record<string, unknown>;
}

export interface NotificationConfig {
  telegram_chat_id?: string;
  telegram_token?: string;
}

class NotificationService {

  /**
   * Send notification to Telegram via Bot API with inline keyboard
   */
  async sendTelegramNotification(
    botToken: string,
    chatId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      const timestamp = new Date().toLocaleString("vi-VN");
      
      // Build message with cleaner format - only show changes
      let message = `Đơn hàng 📦 <u><b>${payload.orderCode || "N/A"}</b></u> có cập nhật mới\n\n`;
      
      // Changes section - only if there are changes
      if (Array.isArray(payload.data?.changes) && payload.data.changes.length > 0) {
        message += `🔄 <b>Thay đổi:</b>\n`;
        (payload.data.changes as string[]).forEach((change) => {
          message += `  - ${change}\n`;
        });
      } else {
        message += `${payload.description}\n`;
      }
      
      // Add updated by information if available
      if (payload.data?.updatedBy) {
        message += `\n👤 <b>Người cập nhật:</b> ${payload.data.updatedBy}`;
      }
      
      message += `\n<i>${timestamp}</i>`;

      // Create inline keyboard with buttons (only if HTTPS URL is available)
      const appUrl = import.meta.env.VITE_APP_URL;
      const keyboard = appUrl && appUrl.startsWith("https://")
        ? {
            inline_keyboard: [
              [
                {
                  text: "🔍 Xem Chi Tiết",
                  url: `${appUrl}/orders/${payload.orderId}`,
                },
                {
                  text: "✍️ Chỉnh Sửa",
                  url: `${appUrl}/orders/${payload.orderId}/edit`,
                },
              ],
            ],
          }
        : undefined;

      // Send directly to Telegram API
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
            parse_mode: "HTML",
            ...(keyboard && { reply_markup: keyboard }),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Telegram API failed: ${error}`);
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

      if (config.telegram_chat_id && config.telegram_token) {
        await this.sendTelegramNotification(
          config.telegram_token,
          config.telegram_chat_id,
          payload,
        );
      } else {
        console.warn("⚠️ Telegram notification service not configured");
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw error;
    }
  }

}

export const notificationService = new NotificationService();
