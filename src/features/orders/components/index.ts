// src/features/orders/components/index.ts

// Existing components
export { FormField } from './FormField';
export { TextAreaField } from './TextAreaField';
export { StatusSelect } from './StatusSelect';
export { FormSection } from './FormSection';
export { OrderItem } from './OrderItem';
export { OrderSummary } from './OrderSummary';
export { TabNavigation } from './shared/TabNavigation.tsx';
export type { Tab } from './shared/TabNavigation.tsx';

// New shared components
export { SectionCard } from './shared/SectionCard';
export { InfoRow } from './shared/InfoRow';
export { OrderHeader } from './shared/OrderHeader';
export { ActionButtons } from './shared/ActionButtons';

// Section components
export { OrderInfoSection } from './sections/OrderInfoSection';
export { OrderStatusSection } from './sections/OrderStatusSection';
export { CustomerInfoSection } from './sections/CustomerInfoSection';
export { ShippingInfoSection } from './sections/ShippingInfoSection';
export { ProductsListSection } from './sections/ProductsListSection';
export { FinancialInputSection } from './sections/FinancialInputSection';

// Cards
export { FinancialSummaryCard } from './cards/FinancialSummaryCard';

// Modals
export { DeleteConfirmModal } from './modals/DeleteConfirmModal';