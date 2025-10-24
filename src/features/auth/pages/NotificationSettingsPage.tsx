// features/auth/pages/NotificationSettingsPage.tsx

import { FiAlertCircle, FiBell, FiCopy, FiSave } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import type { NotificationConfig } from "@/services/notificationService.ts";

export const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [config, setConfig] = useState<NotificationConfig>({
    telegram_chat_id: import.meta.env.VITE_TELEGRAM_CHAT_ID || "",
    telegram_token: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      navigate("/login");
    }
  }, [user, initialized, navigate]);

  // Load config from env
  useEffect(() => {
    setConfig({
      telegram_chat_id: import.meta.env.VITE_TELEGRAM_CHAT_ID || "",
      telegram_token: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "",
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // In a real app, you would save these to .env or a config file
      // For now, just show success message
      console.log("Config:", config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center pt-20">
        <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <IoArrowBack className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiBell className="w-8 h-8" />
              Cài đặt thông báo
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông báo qua Telegram
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
              ✓
            </div>
            <p className="text-sm text-green-800">Lưu cài đặt thành công!</p>
          </div>
        )}

        {/* Telegram Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✈</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Telegram</h2>
          </div>

          <div className="space-y-4">
            {/* Enable Telegram */}
            <p className="text-sm text-gray-600">
              Thông báo sẽ được gửi tới Telegram bot của bạn
            </p>

            {/* Bot Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Token
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  name="telegram_token"
                  value={config.telegram_token}
                  onChange={handleChange}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                {config.telegram_token && (
                  <button
                    onClick={() => handleCopy(config.telegram_token!, "token")}
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tạo bot từ @BotFather trên Telegram
              </p>
            </div>

            {/* Chat ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chat ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="telegram_chat_id"
                  value={config.telegram_chat_id}
                  onChange={handleChange}
                  placeholder="123456789 hoặc -100123456789"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                {config.telegram_chat_id && (
                  <button
                    onClick={() => handleCopy(config.telegram_chat_id!, "chat_id")}
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Chat ID của bạn hoặc group ID (bắt đầu với -)
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Hướng dẫn</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Lưu các giá trị trên vào file <code className="bg-white px-2 py-1 rounded">.env.local</code></li>
            <li>• Sử dụng các biến: <code className="bg-white px-2 py-1 rounded">VITE_TELEGRAM_BOT_TOKEN</code></li>
            <li>• <code className="bg-white px-2 py-1 rounded">VITE_TELEGRAM_CHAT_ID</code></li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                {copied ? "Đã sao chép!" : "Lưu cài đặt"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
