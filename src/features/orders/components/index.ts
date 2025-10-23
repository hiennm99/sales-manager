// src/features/orders/components/index.ts
// Refactored - Using common components

// Form Input components
export { OrderItemInput } from "./sections/OrderItemInput.tsx";

// List components
export { OrderCardView } from "./OrderCardView";
export { OrderSummary } from "./OrderSummary";
export { OrderTable } from "./OrderTable";

// Shared components
export { OrderHeader } from "./shared/OrderHeader";
export { TabNavigation } from "./shared/TabNavigation";
export type { Tab } from "./shared/TabNavigation";

// Section components (All use common TextBox/OptionBox)
export { CustomerInfoSection } from "./sections/CustomerInfoSection";
export { FinancialInputSection } from "./sections/FinancialInputSection";
export { OrderInfoSection } from "./sections/OrderInfoSection";
export { OrderItemsSection } from "./sections/OrderItemsSection.tsx";
export { OrderStatusSection } from "./sections/OrderStatusSection";
export { ShippingInfoSection } from "./sections/ShippingInfoSection";

// Cards
export { FinancialSummaryCard } from "./cards/FinancialSummaryCard";

// Form container
export { OrderForm } from "./OrderForm";

// Preview pictures and history
export { OrderDetailTabs } from "./OrderDetailTabs";
export { OrderHistoryTimeline } from "./OrderHistoryTimeline";
export { OrderHistoryTree } from "./OrderHistoryTree";
export { PreviewPictureGallery } from "./PreviewPictureGallery";
export { PreviewPictureUpload } from "./PreviewPictureUpload";
