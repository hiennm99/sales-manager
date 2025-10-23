// features/employees/components/EmployeeForm.tsx

import React, { useEffect, useState } from "react";
import { FormActions, FormField, FormGroup } from "../../../components/forms";
import { Input } from "../../../components/ui/Input";
import { DEFAULTS } from "../../../constants";
import type { Employee, EmployeeFormData } from "../../../types/employee";

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  isLoading?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    code: "",
    avatar: "",
    role: "",
    base_salary: 0,
    sales_commission_rate: DEFAULTS.COMMISSION_RATE,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        code: employee.code,
        avatar: employee.avatar,
        role: employee.role,
        base_salary: employee.base_salary || 0,
        sales_commission_rate:
          employee.sales_commission_rate || DEFAULTS.COMMISSION_RATE,
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormGroup
        title="Thông tin nhân viên"
        description="Nhập chi tiết nhân viên"
        bordered
      >
        <FormField label="Tên nhân viên" name="name" required>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên nhân viên"
            required
          />
        </FormField>

        <FormField label="Mã nhân viên" name="code" required>
          <Input
            id="code"
            name="code"
            type="text"
            value={formData.code}
            onChange={handleChange}
            placeholder="Nhập mã nhân viên"
            required
          />
        </FormField>

        <FormField label="Chức vụ" name="role" required>
          <Input
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleChange}
            placeholder="Nhập chức vụ (VD: Manager, Designer, ...)"
            required
          />
        </FormField>
      </FormGroup>

      <FormGroup
        title="Thông tin lương"
        description="Cấu hình lương và hoa hồng"
        bordered
      >
        <FormField label="Lương cơ bản (VND/tháng)" name="base_salary">
          <Input
            id="base_salary"
            name="base_salary"
            type="number"
            value={formData.base_salary}
            onChange={handleChange}
            placeholder="Nhập lương cơ bản"
            min="0"
            step="100000"
          />
        </FormField>

        <FormField
          label="Tỷ lệ hoa hồng (%/tháng)"
          name="sales_commission_rate"
          helperText={`Mặc định: ${DEFAULTS.COMMISSION_RATE}%`}
        >
          <Input
            id="sales_commission_rate"
            name="sales_commission_rate"
            type="number"
            value={formData.sales_commission_rate}
            onChange={handleChange}
            placeholder={`Nhập tỷ lệ hoa hồng (VD: ${DEFAULTS.COMMISSION_RATE})`}
            min="0"
            max="100"
            step="0.1"
          />
        </FormField>
      </FormGroup>

      <FormGroup title="Avatar" description="Ảnh đại diện nhân viên" bordered>
        <FormField label="URL Avatar" name="avatar">
          <Input
            id="avatar"
            name="avatar"
            type="url"
            value={formData.avatar}
            onChange={handleChange}
            placeholder="Nhập URL avatar"
          />
        </FormField>
        {formData.avatar && (
          <div className="mt-3">
            <img
              src={formData.avatar}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        )}
      </FormGroup>

      <FormActions
        submitText={employee ? "Cập nhật" : "Tạo mới"}
        isLoading={isLoading}
        onCancel={() => window.history.back()}
        layout="horizontal"
      />
    </form>
  );
};
