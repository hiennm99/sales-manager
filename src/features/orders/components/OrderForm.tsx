// src/features/orders/components/OrderForm.tsx

import { ActionButtons } from "@components/common";
import { ConfirmModal } from "@components/modals";
import { DEFAULTS } from "@constants";
import { useEmployeeStore } from "@features/employees";
import { ORDER_DEFAULT_VALUES, PreviewSection, useOrderCalculations, useOrderStore } from "@features/orders";
import { useProductStore } from "@features/products";
import { useShopStore } from "@features/shops";
import { useStatusStore } from "@features/statuses";
import { useConfirmModal } from "@hooks";
import { useExchangeRateStore } from "@stores";
import type { Order, OrderItem, OrderItemFormData, Product } from "@types";
import { populateEmployeeName } from "@types";
import React, { useEffect, useState } from "react";
import { FiClock, FiDollarSign, FiFileText, FiImage, FiPackage, FiTrash2, FiTruck, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
    CustomerInfoSection,
    FinancialInputSection,
    FinancialSummaryCard,
    OrderHeader,
    OrderHistorySection,
    OrderInfoSection,
    OrderItemsSection,
    OrderStatusSection,
    ShippingInfoSection,
    type Tab,
    TabNavigation
} from "./index";

interface OrderFormProps {
  mode: "create" | "edit";
  onSubmit: (
    updatedOrder: Partial<Order>,
    updatedOrderItems: OrderItem[]
  ) => Promise<void>;
  onDelete?: () => void;
  children?: React.ReactNode;
  orderId?: number;
}

export const OrderForm: React.FC<OrderFormProps> = ({
                                                      mode,
                                                      onSubmit,
                                                      onDelete,
                                                      children,
                                                      orderId
                                                    }) => {
  const navigate = useNavigate();

  // Lấy draft state và các hàm cập nhật trực tiếp từ useOrderStore
  const {
    draftOrder,
    draftItems,
    draftStatusValues,
    updateDraftOrder,
    updateDraftItems,
    updateDraftStatus,
    resetDraft,
    isLoading
  } = useOrderStore();

  const { selectedShop } = useShopStore();
  const { getProductBySku, fetchProducts } = useProductStore();
  const {
    generalStatuses,
    customerStatuses,
    factoryStatuses,
    deliveryStatuses,
    fetchAllStatuses
  } = useStatusStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  const confirmModal = useConfirmModal();
  const [activeTab, setActiveTab] = useState<string>("order-info");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State này vẫn cần thiết cho UI để hiển thị thông tin sản phẩm đã chọn
  const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>(
    []
  );

  // Đồng bộ hóa selectedProducts với draftItems từ stores
  useEffect(() => {
    const products = draftItems.map(
      (item) => getProductBySku(item.sku) || null
    );
    setSelectedProducts(products);
  }, [draftItems, getProductBySku]);

  // ✅ USE CUSTOM HOOK: Tính toán realtime cho cả Create và Edit mode
  // Source of truth duy nhất: draft state (không dùng giá trị từ database)
  const calculations = useOrderCalculations({ draftOrder, draftItems });

  // Get global exchange rate for fallback
  const globalExchangeRate = useExchangeRateStore(
    (state) => state.exchangeRate
  );

  // Helper to get effective exchange rate
  const getEffectiveRate = (
    fieldValue: number | undefined,
    mainRate: number | undefined
  ): number => {
    if (fieldValue && fieldValue !== DEFAULTS.EXCHANGE_RATE) {
      return fieldValue;
    }
    const mainRateValue =
      mainRate && mainRate !== DEFAULTS.EXCHANGE_RATE ? mainRate : undefined;
    return mainRateValue || globalExchangeRate || DEFAULTS.EXCHANGE_RATE;
  };

  // Calculate effective exchange rates
  const effectiveExchangeRate = getEffectiveRate(
    draftOrder.exchangeRate,
    undefined
  );
  const effectiveShippingRate = getEffectiveRate(
    draftOrder.shippingExchangeRate,
    draftOrder.exchangeRate
  );
  const effectiveRefundRate = getEffectiveRate(
    draftOrder.refundFeeExchangeRate,
    draftOrder.exchangeRate
  );
  const effectiveOtherFeeRate = getEffectiveRate(
    draftOrder.otherFeeExchangeRate,
    draftOrder.exchangeRate
  );
  const effectiveBonusRate = getEffectiveRate(
    draftOrder.otherBonusExchangeRate,
    draftOrder.exchangeRate
  );

  const tabs: Tab[] =
    mode === "create"
      ? [
        {
          id: "order-info",
          label: "Thông tin đơn",
          icon: <FiFileText className="w-5 h-5" />
        },
        {
          id: "customer",
          label: "Khách hàng",
          icon: <FiUser className="w-5 h-5" />
        },
        {
          id: "products",
          label: "Sản phẩm",
          icon: <FiPackage className="w-5 h-5" />
        },
        {
          id: "financial",
          label: "Tài chính",
          icon: <FiDollarSign className="w-5 h-5" />
        }
      ]
      : [
        {
          id: "order-info",
          label: "Thông tin đơn",
          icon: <FiFileText className="w-5 h-5" />
        },
        {
          id: "customer",
          label: "Khách hàng",
          icon: <FiUser className="w-5 h-5" />
        },
        {
          id: "shipping",
          label: "Vận chuyển",
          icon: <FiTruck className="w-5 h-5" />
        },
        {
          id: "products",
          label: "Sản phẩm",
          icon: <FiPackage className="w-5 h-5" />
        },
        {
          id: "financial",
          label: "Tài chính",
          icon: <FiDollarSign className="w-5 h-5" />
        },
        {
          id: "preview",
          label: "Xem trước",
          icon: <FiImage className="w-5 h-5" />
        },
        {
          id: "history",
          label: "Lịch sử đơn",
          icon: <FiClock className="w-5 h-5" />
        }
      ];

  useEffect(() => {
    fetchAllStatuses();
    fetchProducts();
    fetchEmployees();
  }, [fetchAllStatuses, fetchProducts, fetchEmployees]);

  // Populate employee names when employees are loaded and we have employeeId(s) from database
  useEffect(() => {
    // Skip if employees haven't loaded yet
    if (employees.length === 0) return;

    console.log("🔍 Employee population effect:", {
      employeesLength: employees.length,
      employeeId: draftOrder.employeeId,
      employeeName: draftOrder.employeeName,
      sellerEmployeeId: draftOrder.sellerEmployeeId,
      sellerEmployeeName: draftOrder.sellerEmployeeName
    });

    // If we have employee IDs but no names, populate them
    const needsArtistName =
      draftOrder.employeeId &&
      (!draftOrder.employeeName || draftOrder.employeeName.trim() === "");
    const needsSellerName =
      draftOrder.sellerEmployeeId &&
      (!draftOrder.sellerEmployeeName ||
        draftOrder.sellerEmployeeName.trim() === "");

    if (needsArtistName || needsSellerName) {
      console.log("📝 Populating employee names");
      const updatedOrder = populateEmployeeName(draftOrder, employees);
      console.log("✅ Updated order:", {
        employeeName: updatedOrder.employeeName,
        sellerEmployeeName: updatedOrder.sellerEmployeeName
      });

      const hasChanges =
        (updatedOrder.employeeName &&
          updatedOrder.employeeName !== draftOrder.employeeName) ||
        (updatedOrder.sellerEmployeeName &&
          updatedOrder.sellerEmployeeName !== draftOrder.sellerEmployeeName);

      if (hasChanges) {
        console.log("🔄 Updating draft order with employee names");
        updateDraftOrder(updatedOrder);
      }
    }
  }, [
    employees.length,
    draftOrder.employeeId,
    draftOrder.sellerEmployeeId,
    draftOrder.employeeName,
    draftOrder.sellerEmployeeName,
    employees,
    updateDraftOrder
  ]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!draftOrder.shopId) newErrors.shopId = "Vui lòng chọn cửa hàng";
    if (!draftOrder.orderId?.trim())
      newErrors.orderId = "Mã đơn hàng là bắt buộc";
    if (!draftOrder.orderDate)
      newErrors.orderDate = "Ngày đặt hàng là bắt buộc";
    if (!draftOrder.customerName?.trim())
      newErrors.customerName = "Tên khách hàng là bắt buộc";
    if (!draftOrder.customerAddress?.trim())
      newErrors.customerAddress = "Địa chỉ khách hàng là bắt buộc";
    if (draftItems.length === 0) newErrors.items = "Phải có ít nhất 1 sản phẩm";
    draftItems.forEach((item, index) => {
      if (!item.sku.trim()) newErrors[`item_sku_${index}`] = "SKU là bắt buộc";
      if (item.quantity <= 0)
        newErrors[`item_quantity_${index}`] = "Số lượng phải lớn hơn 0";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const isNumericField = [
      "itemTotalUsd",
      "discountRate",
      "buyerPaidUsd",
      "orderEarningsUsd",
      "exchangeRate",
      "shippingFeeUsd",
      "shippingExchangeRate",
      "refundFeeUsd",
      "refundFeeExchangeRate",
      "otherFeeUsd",
      "otherFeeExchangeRate",
      "otherBonusUsd",
      "otherBonusExchangeRate",
      "artistCommissionRate",
      "employeeId",
      "sellerEmployeeId"
    ].includes(name);

    const finalValue = isNumericField ? Number(value) || 0 : value;

    if (
      name === "employeeId" ||
      name === "sellerEmployeeId" ||
      name === "employeeName" ||
      name === "sellerEmployeeName"
    ) {
      console.log("👤 Employee field change:", {
        name,
        value,
        finalValue,
        type: typeof value
      });
    }

    updateDraftOrder({ [name]: finalValue });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (
    type: "general" | "customer" | "factory" | "delivery",
    value: number
  ) => {
    updateDraftStatus(type, value);
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemFormData,
    value: string | number
  ) => {
    const newItems = [...draftItems];
    newItems[index] = { ...newItems[index], [field]: value };
    updateDraftItems(newItems);
    if (errors[`item_${field}_${index}`]) {
      setErrors((prev) => ({ ...prev, [`item_${field}_${index}`]: "" }));
    }
  };

  const handleProductSelect = (index: number, product: Product | null) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts[index] = product;
    setSelectedProducts(newSelectedProducts);
  };

  const handleAddItem = () => {
    const newItem: OrderItemFormData = {
      sku: "",
      size: "",
      type: "",
      quantity: ORDER_DEFAULT_VALUES.ITEM_QUANTITY,
      unit_price_usd: 0
    };
    updateDraftItems([...draftItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (draftItems.length > 1) {
      updateDraftItems(draftItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // ✅ Sử dụng giá trị từ calculations (realtime)
    const calculatedItemTotalUsd = calculations.itemTotalUsd;

    console.log("📋 Form submission - Draft Order:", {
      employeeId: draftOrder.employeeId,
      employeeName: draftOrder.employeeName,
      sellerEmployeeId: draftOrder.sellerEmployeeId,
      sellerEmployeeName: draftOrder.sellerEmployeeName
    });

    // 1. Chuẩn bị dữ liệu Order (convert camelCase → snake_case)
    const updatedOrder: Partial<Order> = {
      // Basic info
      shop_id: draftOrder.shopId,
      order_id: draftOrder.orderId,
      order_date: draftOrder.orderDate,
      scheduled_ship_date: draftOrder.scheduledShipDate || null,

      // Customer info
      customer_name: draftOrder.customerName,
      customer_address: draftOrder.customerAddress,
      customer_phone: draftOrder.customerPhone || null,
      customer_email: draftOrder.customerEmail || null,
      customer_notes: draftOrder.customerNotes || null,

      // Artist Employee
      artist_employee_id: draftOrder.employeeId || null,
      artist_commission_rate: draftOrder.artistCommissionRate || 0,

      // Seller Employee
      seller_employee_id: draftOrder.sellerEmployeeId || null,

      // Shipping info
      actual_ship_date: draftOrder.actualShipDate || null,
      carrier_unit: draftOrder.carrierUnit || null,
      carrier_notes: draftOrder.carrierNotes || null,
      tracking_number: draftOrder.trackingNumber || null,
      internal_tracking_number: draftOrder.internalTrackingNumber || null,

      // Financial data (calculated + user input)
      item_total_usd: calculatedItemTotalUsd,
      discount_rate: draftOrder.discountRate || 0,
      buyer_paid_usd: draftOrder.buyerPaidUsd || 0,
      order_earnings_usd: draftOrder.orderEarningsUsd || 0,
      exchange_rate: effectiveExchangeRate,
      shipping_fee_usd: draftOrder.shippingFeeUsd || 0,
      shipping_exchange_rate: effectiveShippingRate,
      refund_fee_usd: draftOrder.refundFeeUsd || 0,
      refund_fee_exchange_rate: effectiveRefundRate,
      other_fee_usd: draftOrder.otherFeeUsd || 0,
      other_fee_exchange_rate: effectiveOtherFeeRate,
      other_bonus_usd: draftOrder.otherBonusUsd || 0,
      other_bonus_exchange_rate: effectiveBonusRate,
      other_bonus_notes: draftOrder.otherBonusNotes || null,
      refund_fee_notes: draftOrder.refundFeeNotes || null,
      other_fee_notes: draftOrder.otherFeeNotes || null,

      // Status IDs
      general_status_id: draftStatusValues.general,
      customer_status_id: draftStatusValues.customer,
      factory_status_id: draftStatusValues.factory,
      delivery_status_id: draftStatusValues.delivery
    };

    // 2. Chuẩn bị dữ liệu OrderItems riêng biệt
    const updatedOrderItems: OrderItem[] = draftItems.map((item) => ({
      id: 0, // API sẽ handle id
      order_id: 0, // API sẽ handle order_id
      sku: item.sku,
      size: item.size,
      type: item.type,
      quantity: item.quantity,
      unit_price_usd: item.unit_price_usd || 0,
      item_total_usd: item.quantity * (item.unit_price_usd || 0),
      created_at: new Date(),
      updated_at: new Date()
    }));

    try {
      // GỌI onSubmit VỚI 2 THAM SỐ RIÊNG BIỆT
      await onSubmit(updatedOrder, updatedOrderItems);

      if (mode === "edit") {
        alert("Đã lưu thay đổi thành công!");
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleReset = () => {
    if (mode === "create") {
      resetDraft();
    } else {
      // Cách đơn giản và an toàn nhất để reset form edit là reload lại dữ liệu gốc
      confirmModal.showConfirm(
        {
          title: "Xác nhận reset",
          message:
            "Bạn có muốn hủy bỏ mọi thay đổi và tải lại dữ liệu gốc của đơn hàng không?",
          confirmText: "Tải lại",
          variant: "warning"
        },
        () => window.location.reload()
      );
    }
    setErrors({});
  };

  const handleCancel = () => {
    navigate("/orders");
  };

  const handleDeleteClick = () => {
    if (!onDelete) return;
    confirmModal.showConfirm(
      {
        title: "Xóa đơn hàng",
        message: (
          <div className="space-y-2">
            <p>
              Bạn có chắc chắn muốn xóa đơn hàng{" "}
              <strong>{draftOrder.orderId}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Hành động này không thể hoàn tác!
            </p>
          </div>
        ),
        confirmText: "Xóa đơn hàng",
        cancelText: "Hủy",
        variant: "delete"
      },
      async () => {
        await onDelete();
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-15xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {/*
         * HEADER SECTION
         * Stacks on mobile, splits on desktop.
         */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <OrderHeader
            title={
              mode === "create"
                ? "Tạo đơn hàng mới"
                : `Chỉnh sửa ${draftOrder.orderId}`
            }
            subtitle={
              mode === "create"
                ? "Điền thông tin để tạo đơn hàng mới"
                : `Ngày đặt: ${new Date(draftOrder.orderDate).toLocaleDateString("vi-VN")}`
            }
            showBackButton={mode === "edit"}
            onBack={() => navigate("/orders")}
            isEdit={mode === "edit"}
          />
          {mode === "edit" && onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <FiTrash2 className="w-5 h-5" />
              Xóa đơn hàng
            </button>
          )}
        </div>

        {/*
         * TABS SECTION
         * Wraps in a bordered container and allows horizontal scrolling on mobile.
         */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200">
          <div className="w-full overflow-x-auto">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/*
           * MAIN LAYOUT GRID
           * Mobile: Summary (1st), Form (2nd)
           * Desktop: Form (1st col), Summary (2nd col, sticky)
           */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* --- FINANCIAL SUMMARY (MOBILE: 1ST, DESKTOP: 2ND) --- */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="lg:sticky lg:top-8">
                <FinancialSummaryCard
                  itemTotal={calculations.itemTotalUsd}
                  itemTotalVND={calculations.itemTotalVnd}
                  discountRate={draftOrder.discountRate || 0}
                  buyerPaidUSD={draftOrder.buyerPaidUsd || 0}
                  buyerPaidVND={calculations.buyerPaidVnd}
                  orderEarnings={draftOrder.orderEarningsUsd || 0}
                  orderEarningsVND={calculations.orderEarningsVnd}
                  exchangeRate={effectiveExchangeRate}
                  shippingFeeUsd={draftOrder.shippingFeeUsd || 0}
                  shippingExchangeRate={effectiveShippingRate}
                  refundFeeUsd={draftOrder.refundFeeUsd || 0}
                  refundFeeExchangeRate={effectiveRefundRate}
                  otherFeeUsd={draftOrder.otherFeeUsd || 0}
                  otherFeeExchangeRate={effectiveOtherFeeRate}
                  otherBonusUsd={draftOrder.otherBonusUsd || 0}
                  otherBonusExchangeRate={effectiveBonusRate}
                />
              </div>
            </div>

            {/* --- FORM CONTENT (MOBILE: 2ND, DESKTOP: 1ST) --- */}
            <div className="lg:col-span-2 lg:order-1 space-y-6">
              {/*
               * Each tab's content is wrapped in a modern card for a
               * clean, contained, and modern appearance.
               */}
              {activeTab === "order-info" && (
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
                  <OrderInfoSection
                    formData={draftOrder}
                    shopName={selectedShop?.name}
                    errors={errors}
                    onChange={handleChange}
                  />
                  <hr className="border-gray-200" />
                  <OrderStatusSection
                    statusValues={draftStatusValues}
                    statusOptions={{
                      general: generalStatuses,
                      customer: customerStatuses,
                      factory: factoryStatuses,
                      delivery: deliveryStatuses
                    }}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              )}
              {activeTab === "customer" && (
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                  <CustomerInfoSection
                    formData={draftOrder}
                    errors={errors}
                    onChange={handleChange}
                  />
                </div>
              )}
              {activeTab === "shipping" && mode === "edit" && (
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                  <ShippingInfoSection
                    formData={draftOrder}
                    errors={errors}
                    onChange={handleChange}
                  />
                </div>
              )}
              {activeTab === "products" && (
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                  <OrderItemsSection
                    items={draftItems}
                    selectedProducts={selectedProducts}
                    errors={errors}
                    onChange={handleItemChange}
                    onAdd={handleAddItem}
                    onRemove={handleRemoveItem}
                    onProductSelect={handleProductSelect}
                  />
                </div>
              )}
              {activeTab === "preview" && mode === "edit" && orderId && (
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                  <PreviewSection
                    orderId={orderId}
                    employeeId={draftOrder.employeeId || undefined}
                  />
                </div>
              )}
              {activeTab === "financial" && (
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                  <FinancialInputSection
                    formData={{
                      ...draftOrder,
                      itemTotalUsd: calculations.itemTotalUsd
                    }}
                    errors={errors}
                    onChange={handleChange}
                  />
                </div>
              )}
              {activeTab === "history" && mode === "edit" && orderId && (
                <OrderHistorySection orderId={orderId} />
              )}
            </div>
          </div>

          {/* --- FORM ACTIONS --- */}
          <ActionButtons
            mode={mode}
            isLoading={isLoading}
            onReset={handleReset}
            onCancel={handleCancel}
          />
        </form>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.closeModal}
          onConfirm={confirmModal.handleConfirm}
          onCancel={confirmModal.closeModal}
          title={confirmModal.modalConfig?.title}
          message={confirmModal.modalConfig?.message || ""}
          confirmText={confirmModal.modalConfig?.confirmText}
          cancelText={confirmModal.modalConfig?.cancelText}

          variant={confirmModal.modalConfig?.variant}
          isLoading={confirmModal.isLoading}
        />
      </div>
    </div>
  );
};