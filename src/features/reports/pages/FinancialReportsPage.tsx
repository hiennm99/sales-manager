// src/features/reports/pages/FinancialReportsPage.tsx

import {
  CreateReportModal,
  IncomingMoneyForm,
  ReceivedMoneyForm,
  ReportFilters,
  ReportListView,
  TransferredMoneyForm,
} from "@/features/reports/components";
import {
  useShopSelectors,
  useShopStore,
} from "@/features/shops/store/useShopStore";
import type {
  ExcelUploadData,
  FinancialReportFilters,
  FinancialReportPeriod,
} from "@/types/financialReport";
import { formatCurrency } from "@/types/financialReport";
import {
  FiFileText,
  FiList,
  FiPlus,
  FiUpload,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiImage,
} from "react-icons/fi";
import React, { useCallback, useEffect, useState } from "react";
import { DataTableTab } from "../components/DataTableTab";
import { DocumentsTab } from "../components/DocumentsTab";
import { ExpenseForm } from "../components/ExpenseForm";
import { MoneyOnEtsyForm } from "../components/MoneyOnEtsyForm";
import { OverviewTab } from "../components/OverviewTab";
import {
  expensesServiceApi,
  financialReportServiceApi,
  incomingMoneyServiceApi,
  moneyOnEtsyServiceApi,
  receivedMoneyServiceApi,
  transferredMoneyServiceApi,
} from "../services/financialReport.service.api";

type TabType =
  | "overview"
  | "money-on-etsy"
  | "incoming"
  | "received"
  | "expenses"
  | "transferred"
  | "documents";

export const FinancialReportsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [uploadedData, setUploadedData] = useState<ExcelUploadData | null>(
    null,
  );
  const [currentReport, setCurrentReport] =
    useState<FinancialReportPeriod | null>(null);
  const [allReports, setAllReports] = useState<FinancialReportPeriod[]>([]);
  const [filters, setFilters] = useState<FinancialReportFilters>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Manual data entry
  const [moneyOnEtsyData, setMoneyOnEtsyData] = useState<any[]>([]);
  const [incomingMoneyData, setIncomingMoneyData] = useState<any[]>([]);
  const [receivedMoneyData, setReceivedMoneyData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [transferredMoneyData, setTransferredMoneyData] = useState<any[]>([]);

  // ✅ OPTIMIZED: Use selectors to avoid unnecessary re-renders
  const shops = useShopSelectors.useShops();
  const fetchShops = useShopStore((state) => state.fetchShops);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const reports = await financialReportServiceApi.getReportPeriods(filters);
      setAllReports(reports);
    } catch (error) {
      console.error("Error loading reports:", error);
      alert("Lỗi khi tải danh sách báo cáo");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShops();
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadReports]); // fetchShops is stable from Zustand store

  const handleCreateNewReport = async (
    shopId: number,
    year: number,
    month: number,
  ) => {
    const periodStart = new Date(year, month - 1, 1)
      .toISOString()
      .split("T")[0];
    const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

    try {
      const newReport = await financialReportServiceApi.createReportPeriod({
        shopId,
        year,
        month,
        periodStart,
        periodEnd,
        totalSales: 0,
        totalFees: 0,
        netProfit: 0,
        marketingFees: 0,
        status: "draft",
      });

      setCurrentReport(newReport);
      setViewMode("detail");
      await loadReports();
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Lỗi khi tạo báo cáo. Vui lòng thử lại.");
    }
  };

  const handleSaveReport = async () => {
    if (!currentReport) return;

    setIsSaving(true);
    try {
      // If report already has an ID, just update it
      if (currentReport.id && currentReport.id > 0) {
        await financialReportServiceApi.updateReportPeriod(currentReport.id, {
          totalSales: currentReport.total_sales,
          totalFees: currentReport.total_fees,
          netProfit: currentReport.net_profit,
          marketingFees: currentReport.marketing_fees,
          status: "draft",
        });
        alert("Đã lưu báo cáo thành công!");
        await loadReports();
        setViewMode("list");
        setCurrentReport(null);
        setUploadedData(null);
      } else {
        // Create new report period
        const savedReport = await financialReportServiceApi.createReportPeriod({
          shopId: currentReport.shop_id,
          year: currentReport.year,
          month: currentReport.month,
          periodStart: currentReport.period_start,
          periodEnd: currentReport.period_end,
          totalSales: currentReport.total_sales,
          totalFees: currentReport.total_fees,
          netProfit: currentReport.net_profit,
          marketingFees: currentReport.marketing_fees,
          status: "draft",
        });

        // Save all related data from uploaded Excel
        if (uploadedData) {
          if (uploadedData.moneyOnEtsy.length > 0) {
            await moneyOnEtsyServiceApi.create(
              uploadedData.moneyOnEtsy.map((item) => ({
                report_period_id: savedReport.id,
                date: item.date,
                description: item.description,
                amount: item.amount,
                currency: item.currency,
                type: item.type as any,
              })),
            );
          }

          if (uploadedData.incomingMoney.length > 0) {
            await incomingMoneyServiceApi.create(
              uploadedData.incomingMoney.map((item) => ({
                report_period_id: savedReport.id,
                date: item.date,
                order_id: item.orderId,
                description: item.description,
                amount: item.amount,
                currency: item.currency,
                expected_date: item.expectedDate,
                status: "pending",
              })),
            );
          }

          if (uploadedData.receivedMoney.length > 0) {
            await receivedMoneyServiceApi.create(
              uploadedData.receivedMoney.map((item) => ({
                report_period_id: savedReport.id,
                date: item.date,
                order_id: item.orderId,
                description: item.description,
                amount: item.amount,
                currency: item.currency,
                received_date: item.receivedDate,
                payment_method: item.paymentMethod,
              })),
            );
          }

          if (uploadedData.expenses.length > 0) {
            await expensesServiceApi.create(
              uploadedData.expenses.map((item) => ({
                report_period_id: savedReport.id,
                date: item.date,
                category: item.category,
                description: item.description,
                amount: item.amount,
                currency: item.currency,
                payment_method: item.paymentMethod,
              })),
            );
          }

          if (uploadedData.transferredMoney.length > 0) {
            await transferredMoneyServiceApi.create(
              uploadedData.transferredMoney.map((item) => ({
                report_period_id: savedReport.id,
                date: item.date,
                description: item.description,
                amount: item.amount,
                currency: item.currency,
                transfer_date: item.transferDate,
                bank_account: item.bankAccount,
                reference_number: item.referenceNumber,
              })),
            );
          }
        }

        alert("Đã lưu báo cáo thành công!");
        await loadReports();
        setViewMode("list");
        setCurrentReport(null);
        setUploadedData(null);
      }
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Lỗi khi lưu báo cáo. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectReport = async (report: FinancialReportPeriod) => {
    setCurrentReport(report);
    setViewMode("detail");
    // Load related data
    try {
      const [moneyOnEtsy, incoming, received, expenses, transferred] =
        await Promise.all([
          moneyOnEtsyServiceApi.getByReportPeriod(report.id),
          incomingMoneyServiceApi.getByReportPeriod(report.id),
          receivedMoneyServiceApi.getByReportPeriod(report.id),
          expensesServiceApi.getByReportPeriod(report.id),
          transferredMoneyServiceApi.getByReportPeriod(report.id),
        ]);
      setMoneyOnEtsyData(moneyOnEtsy);
      setIncomingMoneyData(incoming);
      setReceivedMoneyData(received);
      setExpensesData(expenses);
      setTransferredMoneyData(transferred);
    } catch (error) {
      console.error("Error loading report data:", error);
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      await financialReportServiceApi.deleteReportPeriod(id);
      await loadReports();
      if (currentReport?.id === id) {
        setCurrentReport(null);
        setViewMode("list");
      }
      alert("Đã xóa báo cáo thành công!");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Lỗi khi xóa báo cáo");
    }
  };

  const handleApproveReport = async (id: number) => {
    try {
      const updatedReport = await financialReportServiceApi.approveReport(id);
      await loadReports();
      if (currentReport?.id === id) {
        setCurrentReport(updatedReport);
      }
      alert("Báo cáo đã được duyệt!");
    } catch (error) {
      console.error("Error approving report:", error);
      alert("Lỗi khi duyệt báo cáo");
    }
  };

  const handleFinalizeReport = async (id: number) => {
    try {
      const updatedReport = await financialReportServiceApi.finalizeReport(id);
      await loadReports();
      if (currentReport?.id === id) {
        setCurrentReport(updatedReport);
      }
      alert("Báo cáo đã được hoàn tất!");
    } catch (error) {
      console.error("Error finalizing report:", error);
      alert("Lỗi khi hoàn tất báo cáo");
    }
  };

  const handleBackToList = () => {
    setCurrentReport(null);
    setViewMode("list");
    setActiveTab("overview");
  };

  const tabs = [
    { id: "overview" as TabType, label: "Tổng Quan", icon: FiFileText },
    {
      id: "money-on-etsy" as TabType,
      label: "Tiền Còn Trên Etsy",
      icon: FiUpload,
    },
    { id: "incoming" as TabType, label: "Tiền Đang Về", icon: FiCalendar },
    { id: "received" as TabType, label: "Tiền Đã Về", icon: FiCheckCircle },
    { id: "expenses" as TabType, label: "Các Chi Phí", icon: FiXCircle },
    { id: "transferred" as TabType, label: "Tiền Đã CK", icon: FiDownload },
    { id: "documents" as TabType, label: "Tài Liệu", icon: FiImage },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Báo Cáo Tài Chính
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý báo cáo tài chính từ Etsy
                </p>
              </div>
            </div>
            {currentReport && (
              <button
                onClick={handleSaveReport}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu Báo Cáo"}
              </button>
            )}
          </div>
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-6">
            {/* Filters */}
            <ReportFilters
              filters={filters}
              onFiltersChange={setFilters}
              shops={shops}
            />

            {/* Create Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <FiPlus className="w-5 h-5" />
                Tạo Báo Cáo Mới
              </button>
            </div>

            {/* Report List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
              </div>
            ) : (
              <ReportListView
                reports={allReports}
                onSelectReport={handleSelectReport}
                onDeleteReport={handleDeleteReport}
                onApproveReport={handleApproveReport}
                onFinalizeReport={handleFinalizeReport}
                selectedReportId={currentReport?.id}
              />
            )}
          </div>
        )}

        {/* Detail View */}
        {viewMode === "detail" && currentReport && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiList className="w-4 h-4" />
              Quay Lại Danh Sách
            </button>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                        ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activeTab === "overview" && (
                <OverviewTab
                  report={currentReport}
                  totalReceived={receivedMoneyData.reduce(
                    (sum, item) => sum + (item.amount || 0),
                    0,
                  )}
                  totalTransferred={transferredMoneyData.reduce(
                    (sum, item) => sum + (item.amount || 0),
                    0,
                  )}
                  totalExpenses={expensesData.reduce(
                    (sum, item) => sum + (item.amount || 0),
                    0,
                  )}
                  onUpdateOverviewImage={(url) =>
                    setCurrentReport({ ...currentReport, notes: url })
                  }
                  onDeleteOverviewImage={() =>
                    setCurrentReport({ ...currentReport, notes: null })
                  }
                  overviewImageUrl={currentReport.notes}
                />
              )}

              {activeTab === "money-on-etsy" && (
                <div className="space-y-6">
                  <MoneyOnEtsyForm
                    reportPeriodId={currentReport.id}
                    shopId={currentReport.shop_id}
                    year={currentReport.year}
                    month={currentReport.month}
                    onAdd={async (item) => {
                      try {
                        const saved = await moneyOnEtsyServiceApi.create([
                          item,
                        ]);
                        setMoneyOnEtsyData([...moneyOnEtsyData, ...saved]);
                        // Success feedback (optional)
                        console.log("Data saved successfully");
                      } catch (error) {
                        console.error("Error saving money on etsy:", error);
                        alert("Lỗi khi lưu dữ liệu");
                      }
                    }}
                  />

                  {moneyOnEtsyData.length > 0 && (
                    <DataTableTab
                      title="Danh Sách Tiền Trên Etsy"
                      data={moneyOnEtsyData.map((item) => ({
                        ...item,
                        id: item.id,
                      }))}
                      columns={[
                        { key: "date", label: "Ngày" },
                        { key: "description", label: "Mô tả" },
                        { key: "type", label: "Loại" },
                        {
                          key: "amount",
                          label: "Số tiền",
                          render: (value) => (
                            <span className="font-semibold text-indigo-600">
                              {formatCurrency(value)}
                            </span>
                          ),
                        },
                      ]}
                      emptyMessage="Chưa có dữ liệu"
                      onDelete={async (id) => {
                        await moneyOnEtsyServiceApi.delete(id);
                        setMoneyOnEtsyData(
                          moneyOnEtsyData.filter((item) => item.id !== id),
                        );
                      }}
                    />
                  )}
                </div>
              )}

              {activeTab === "incoming" && (
                <div className="space-y-6">
                  <IncomingMoneyForm
                    reportPeriodId={currentReport.id}
                    shopId={currentReport.shop_id}
                    year={currentReport.year}
                    month={currentReport.month}
                    onAdd={async (item) => {
                      try {
                        const saved = await incomingMoneyServiceApi.create([
                          item,
                        ]);
                        setIncomingMoneyData([...incomingMoneyData, ...saved]);
                      } catch (error) {
                        console.error("Error saving incoming money:", error);
                        alert("Lỗi khi lưu dữ liệu");
                      }
                    }}
                  />

                  {(uploadedData || incomingMoneyData.length > 0) && (
                    <DataTableTab
                      title="Danh Sách Tiền Đang Về"
                      data={
                        uploadedData
                          ? uploadedData.incomingMoney.map((item, i) => ({
                              ...item,
                              id: i,
                            }))
                          : incomingMoneyData.map((item) => ({
                              ...item,
                              id: item.id,
                            }))
                      }
                      columns={[
                        { key: "date", label: "Ngày" },
                        { key: "order_id", label: "Mã đơn" },
                        { key: "description", label: "Mô tả" },
                        {
                          key: "amount",
                          label: "Số tiền",
                          render: (value) => (
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(value)}
                            </span>
                          ),
                        },
                      ]}
                      emptyMessage="Chưa có dữ liệu"
                      onDelete={
                        !uploadedData
                          ? async (id) => {
                              await incomingMoneyServiceApi.delete(id);
                              setIncomingMoneyData(
                                incomingMoneyData.filter(
                                  (item) => item.id !== id,
                                ),
                              );
                            }
                          : undefined
                      }
                    />
                  )}
                </div>
              )}

              {activeTab === "received" && (
                <div className="space-y-6">
                  <ReceivedMoneyForm
                    reportPeriodId={currentReport.id}
                    shopId={currentReport.shop_id}
                    year={currentReport.year}
                    month={currentReport.month}
                    onAdd={async (item) => {
                      try {
                        const saved = await receivedMoneyServiceApi.create([
                          item,
                        ]);
                        setReceivedMoneyData([...receivedMoneyData, ...saved]);
                      } catch (error) {
                        console.error("Error saving received money:", error);
                        alert("Lỗi khi lưu dữ liệu");
                      }
                    }}
                  />

                  {(uploadedData || receivedMoneyData.length > 0) && (
                    <DataTableTab
                      title="Danh Sách Tiền Đã Về"
                      data={
                        uploadedData
                          ? uploadedData.receivedMoney.map((item, i) => ({
                              ...item,
                              id: i,
                            }))
                          : receivedMoneyData.map((item) => ({
                              ...item,
                              id: item.id,
                            }))
                      }
                      columns={[
                        { key: "date", label: "Ngày" },
                        { key: "order_id", label: "Mã đơn" },
                        { key: "description", label: "Mô tả" },
                        { key: "received_date", label: "Ngày nhận" },
                        {
                          key: "amount",
                          label: "Số tiền",
                          render: (value) => (
                            <span className="font-semibold text-green-600">
                              {formatCurrency(value)}
                            </span>
                          ),
                        },
                      ]}
                      emptyMessage="Chưa có dữ liệu"
                      onDelete={
                        !uploadedData
                          ? async (id) => {
                              await receivedMoneyServiceApi.delete(id);
                              setReceivedMoneyData(
                                receivedMoneyData.filter(
                                  (item) => item.id !== id,
                                ),
                              );
                            }
                          : undefined
                      }
                    />
                  )}
                </div>
              )}

              {activeTab === "expenses" && (
                <div className="space-y-6">
                  <ExpenseForm
                    reportPeriodId={currentReport.id}
                    shopId={currentReport.shop_id}
                    year={currentReport.year}
                    month={currentReport.month}
                    onAdd={async (item) => {
                      try {
                        const saved = await expensesServiceApi.create([item]);
                        setExpensesData([...expensesData, ...saved]);
                      } catch (error) {
                        console.error("Error saving expense:", error);
                        alert("Lỗi khi lưu dữ liệu");
                      }
                    }}
                  />

                  {expensesData.length > 0 && (
                    <DataTableTab
                      title="Danh Sách Chi Phí"
                      data={expensesData.map((item) => ({
                        ...item,
                        id: item.id,
                      }))}
                      columns={[
                        { key: "date", label: "Ngày" },
                        { key: "category", label: "Danh mục" },
                        { key: "description", label: "Mô tả" },
                        {
                          key: "amount",
                          label: "Số tiền",
                          render: (value) => (
                            <span className="font-semibold text-green-600">
                              {formatCurrency(value)}
                            </span>
                          ),
                        },
                      ]}
                      emptyMessage="Chưa có dữ liệu"
                      onDelete={async (id) => {
                        await expensesServiceApi.delete(id);
                        setExpensesData(
                          expensesData.filter((item) => item.id !== id),
                        );
                      }}
                    />
                  )}
                </div>
              )}

              {activeTab === "transferred" && (
                <div className="space-y-6">
                  <TransferredMoneyForm
                    reportPeriodId={currentReport.id}
                    shopId={currentReport.shop_id}
                    year={currentReport.year}
                    month={currentReport.month}
                    onAdd={async (item) => {
                      try {
                        const saved = await transferredMoneyServiceApi.create([
                          item,
                        ]);
                        setTransferredMoneyData([
                          ...transferredMoneyData,
                          ...saved,
                        ]);
                      } catch (error) {
                        console.error("Error saving transferred money:", error);
                        alert("Lỗi khi lưu dữ liệu");
                      }
                    }}
                  />

                  {(uploadedData || transferredMoneyData.length > 0) && (
                    <DataTableTab
                      title="Danh Sách Tiền Đã Chuyển Khoản"
                      data={
                        uploadedData
                          ? uploadedData.transferredMoney.map((item, i) => ({
                              ...item,
                              id: i,
                            }))
                          : transferredMoneyData.map((item) => ({
                              ...item,
                              id: item.id,
                            }))
                      }
                      columns={[
                        { key: "date", label: "Ngày" },
                        { key: "description", label: "Mô tả" },
                        { key: "transfer_date", label: "Ngày CK" },
                        { key: "bank_account", label: "Tài khoản" },
                        {
                          key: "amount",
                          label: "Số tiền",
                          render: (value) => (
                            <span className="font-semibold text-green-600">
                              {formatCurrency(value)}
                            </span>
                          ),
                        },
                      ]}
                      emptyMessage="Chưa có dữ liệu"
                      onDelete={
                        !uploadedData
                          ? async (id) => {
                              await transferredMoneyServiceApi.delete(id);
                              setTransferredMoneyData(
                                transferredMoneyData.filter(
                                  (item) => item.id !== id,
                                ),
                              );
                            }
                          : undefined
                      }
                    />
                  )}
                </div>
              )}

              {activeTab === "documents" && (
                <DocumentsTab report={currentReport} />
              )}
            </div>
          </div>
        )}

        {/* Create Report Modal */}
        <CreateReportModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateNewReport}
          shops={shops}
        />
      </div>
    </div>
  );
};
