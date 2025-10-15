// types/status.ts

import type { BaseEntity } from './common';

// ============================================
// BASE STATUS TYPE
// ============================================
export interface Status extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

// ============================================
// GENERAL STATUS
// ============================================
export interface GeneralStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

// Database statuses (for reference):
// - new: Đơn hàng mới
// - processing: Đang xử lý
// - completed: Đã hoàn thành
// - on_hold: Tạm dừng xử lý
// - cancelled: Đã hủy

// ============================================
// CUSTOMER STATUS
// ============================================
export interface CustomerStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

// Database statuses (for reference):
// - new: Khách hàng vừa tạo đơn
// - info_pending: Chờ khách xác nhận thông tin
// - info_confirmed: Khách đã xác nhận thông tin
// - preview_pending: Chờ khách xác nhận bản xem trước
// - preview_confirmed: Khách đã xác nhận bản xem trước
// - edit_requested: Khách yêu cầu chỉnh sửa
// - redraw_requested: Khách yêu cầu vẽ lại
// - pushing: Khách hối vẽ
// - no_response: Khách không phản hồi
// - reviewed: Khách hàng đã đánh giá đơn hàng
// - cancel_requested: Khách yêu cầu hủy
// - closed: Đơn hàng kết thúc

// ============================================
// FACTORY STATUS
// ============================================
export interface FactoryStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

// Database statuses (for reference):
// - order_pending: Đợi tiếp nhận đơn hàng
// - order_confirmed: Đã tiếp nhận đơn hàng
// - material_prepared: Đã có vải vẽ
// - drawing: Đang vẽ
// - preview_sent: Đã gửi bản xem trước
// - editing: Đang sửa
// - redrawing: Đang vẽ lại
// - drying: Đang đợi tranh khô
// - quality_check: Đang kiểm tra chất lượng
// - packaging: Đang đóng gói
// - handover: Bàn giao vận chuyển
// - rejected: Tranh không đạt, cần vẽ lại
// - completed: Hoàn thành
// - closed: Đơn hàng kết thúc

// ============================================
// DELIVERY STATUS
// ============================================
export interface DeliveryStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

// Database statuses (for reference):
// - tracking_pending: Đã nhận kiện hàng & đợi mã vận đơn
// - on_tracking: Đang vận chuyển
// - delivered: Đã nhận hàng
// - delivery_failed: Giao hàng thất bại
// - returned: Hàng bị hoàn
// - action_needed: Cần hành động (Liên hệ đơn vị vận chuyển, bổ sung giấy tờ)
// - closed: Đơn hàng kết thúc

// ============================================
// COLOR MAPPING LOGIC
// ============================================
// Colors are automatically assigned based on status code patterns:
// - GREEN: completed, delivered, confirmed, reviewed
// - RED: cancelled, cancel_requested, returned, rejected, delivery_failed
// - YELLOW: pending, on_hold, drying, action_needed, pushing, no_response
// - BLUE: processing, drawing, editing, redrawing, quality_check, packaging, on_tracking
// - GRAY: new, order_pending, info_pending, preview_pending, tracking_pending
// - PURPLE: sent, handover, prepared
// - INDIGO: closed

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get badge color classes
export const getStatusColorClasses = (color: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        gray: { bg: 'bg-gray-100', text: 'text-gray-800' },
        red: { bg: 'bg-red-100', text: 'text-red-800' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        green: { bg: 'bg-green-100', text: 'text-green-800' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
    };
    return colorMap[color] || colorMap.gray;
};
