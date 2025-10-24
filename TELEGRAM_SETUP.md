# Hướng Dẫn Setup Telegram Bot

## Bước 1: Tạo Telegram Bot

1. Mở Telegram và tìm **@BotFather**
2. Gửi lệnh `/newbot`
3. Đặt tên cho bot (ví dụ: "Sales Manager Bot")
4. Đặt username cho bot (phải kết thúc bằng `bot`, ví dụ: `sales_manager_bot`)
5. BotFather sẽ trả về **Bot Token** - lưu lại token này

## Bước 2: Lấy Chat ID

### Cách 1: Sử dụng bot để lấy Chat ID

1. Tìm bot bạn vừa tạo trên Telegram
2. Nhấn **Start** hoặc gửi bất kỳ tin nhắn nào
3. Mở trình duyệt và truy cập:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   (Thay `<YOUR_BOT_TOKEN>` bằng token của bạn)
4. Tìm `"chat":{"id":123456789}` trong response - đó là Chat ID của bạn

### Cách 2: Sử dụng @userinfobot

1. Tìm **@userinfobot** trên Telegram
2. Nhấn **Start**
3. Bot sẽ hiển thị Chat ID của bạn

## Bước 3: Cấu Hình Environment Variables

Thêm vào file `.env` hoặc `.env.local`:

```env
# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here

# App URL (để tạo links trong notification)
VITE_APP_URL=http://localhost:5173
```

### Ví dụ:

```env
VITE_TELEGRAM_BOT_TOKEN=6789012345:ABCdefGHIjklMNOpqrsTUVwxyz123456789
VITE_TELEGRAM_CHAT_ID=123456789
VITE_APP_URL=http://localhost:5173
```

## Bước 4: Test Notification

1. Khởi động ứng dụng:
   ```bash
   npm run dev
   ```

2. Tạo một đơn hàng mới hoặc cập nhật đơn hàng

3. Kiểm tra Telegram - bạn sẽ nhận được notification với 2 nút:
   - **🔍 Xem Chi Tiết** - Mở trang chi tiết đơn hàng
   - **✍️ Chỉnh Sửa** - Mở trang chỉnh sửa đơn hàng

## Tính Năng

### ✅ Đã Có
- ✅ Gửi notification khi tạo đơn hàng mới
- ✅ Gửi notification khi cập nhật đơn hàng
- ✅ Gửi notification khi thay đổi trạng thái
- ✅ Inline keyboard với buttons (URL type)
- ✅ Format đẹp với Markdown
- ✅ Hiển thị thông tin chi tiết đơn hàng

### 📋 Format Notification

```
*🎉 Đơn Hàng Mới*

Đơn hàng mới đã được tạo

🆔 *Order ID:* 123
📦 *Order Code:* ORD-2025-001
📋 *Loại:* Đơn hàng mới
👤 *Khách hàng:* Nguyễn Văn A
💰 *Số tiền:* 1,500,000 VNĐ

⏰ *Thời gian:* 24/10/2025, 09:30:00

[🔍 Xem Chi Tiết] [✍️ Chỉnh Sửa]
```

## Troubleshooting

### Không nhận được notification?

1. **Kiểm tra Bot Token:**
   - Đảm bảo token đúng và không có khoảng trắng thừa
   - Token phải bắt đầu bằng số và có dấu `:`

2. **Kiểm tra Chat ID:**
   - Chat ID phải là số (có thể âm hoặc dương)
   - Đảm bảo bạn đã Start bot trước khi gửi message

3. **Kiểm tra Console:**
   - Mở DevTools Console (F12)
   - Xem có lỗi gì không

4. **Test trực tiếp API:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{"chat_id":"<YOUR_CHAT_ID>","text":"Test message"}'
   ```

### Buttons không hoạt động?

- Buttons sử dụng `url` type nên sẽ mở link trực tiếp
- Đảm bảo `VITE_APP_URL` được set đúng
- Nếu đang dev local, app phải đang chạy

## So Sánh với Discord

| Tính năng | Telegram | Discord |
|-----------|----------|---------|
| Setup | ✅ Rất đơn giản | ❌ Phức tạp (cần bot server) |
| Dependencies | ✅ Không cần | ❌ Cần discord.js |
| Backend | ✅ Không cần | ❌ Cần Express server |
| Inline Buttons | ✅ URL type | ⚠️ Cần callback handler |
| API | ✅ REST API đơn giản | ❌ WebSocket phức tạp |

## Lưu Ý Bảo Mật

⚠️ **QUAN TRỌNG:**
- **KHÔNG** commit file `.env` lên Git
- **KHÔNG** share Bot Token công khai
- Nếu token bị lộ, revoke và tạo bot mới
- Chỉ gửi notification đến Chat ID đã xác thực

## Production Deployment

Khi deploy lên production (Vercel, Netlify, etc.):

1. Thêm environment variables vào platform:
   - `VITE_TELEGRAM_BOT_TOKEN`
   - `VITE_TELEGRAM_CHAT_ID`
   - `VITE_APP_URL` (URL production của bạn)

2. Rebuild và deploy

3. Test notification trên production

## Tài Liệu Tham Khảo

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Inline Keyboard Buttons](https://core.telegram.org/bots/features#inline-keyboards)
- [Markdown Formatting](https://core.telegram.org/bots/api#markdown-style)
