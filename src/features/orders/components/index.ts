// src/features/orders/components/index.ts
// Refactored - Using common components

// Form Input components
export { OrderItemInput } from './sections/OrderItemInput.tsx';

// List components
export { OrderSummary } from './OrderSummary';
export { OrderTable } from './OrderTable';

// Shared components
export { TabNavigation } from './shared/TabNavigation';
export type { Tab } from './shared/TabNavigation';
export { OrderHeader } from './shared/OrderHeader';

// Section components (All use common TextBox/OptionBox)
export { OrderInfoSection } from './sections/OrderInfoSection';
export { OrderStatusSection } from './sections/OrderStatusSection';
export { CustomerInfoSection } from './sections/CustomerInfoSection';
export { ShippingInfoSection } from './sections/ShippingInfoSection';
export { OrderItemsSection } from './sections/OrderItemsSection.tsx';
export { FinancialInputSection } from './sections/FinancialInputSection';

// Cards
export { FinancialSummaryCard } from './cards/FinancialSummaryCard';
