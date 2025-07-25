export interface Employee {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  baseSalary: number;
  isActive: boolean;
  role: 'admin' | 'employee';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  adminNotes?: string;
  days: number;
}

export interface Allowance {
  employeeId: string;
  travelAllowance: number;
  medicalAllowance: number;
  washingAllowance: number;
  hra: number; // Auto-calculated
  da: number; // Auto-calculated
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: {
    travel: number;
    medical: number;
    washing: number;
    hra: number;
    da: number;
  };
  deductions: {
    leaveDays: number;
    leaveDeduction: number;
    tax: number;
  };
  grossSalary: number;
  netSalary: number;
  generatedDate: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'employee';
  employeeData?: Employee;
}