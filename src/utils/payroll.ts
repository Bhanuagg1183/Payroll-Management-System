import { Employee, LeaveRequest, Allowance, PayrollRecord } from '../types';
import { getLeaveRequests, getAllowances } from './storage';

export const calculateHRA = (baseSalary: number): number => {
  // HRA is typically 40% of basic salary
  return Math.round(baseSalary * 0.4);
};

export const calculateDA = (baseSalary: number): number => {
  // DA is typically 20% of basic salary
  return Math.round(baseSalary * 0.2);
};

export const calculateLeaveDeduction = (baseSalary: number, leaveDays: number): number => {
  // Assuming 30 working days per month
  const dailySalary = baseSalary / 30;
  return Math.round(dailySalary * leaveDays);
};

export const calculateTax = (grossSalary: number): number => {
  // Simple tax calculation - 10% for demo purposes
  return Math.round(grossSalary * 0.1);
};

export const generatePayroll = (employee: Employee, month: string, year: number): PayrollRecord => {
  const leaveRequests = getLeaveRequests();
  const allowances = getAllowances();
  
  // Get approved leaves for the employee in the specified month/year
  const approvedLeaves = leaveRequests.filter(leave => {
    const startDate = new Date(leave.startDate);
    const leaveMonth = startDate.getMonth() + 1;
    const leaveYear = startDate.getFullYear();
    
    return leave.employeeId === employee.id && 
           leave.status === 'approved' && 
           leaveMonth === parseInt(month) && 
           leaveYear === year;
  });
  
  const totalLeaveDays = approvedLeaves.reduce((total, leave) => total + leave.days, 0);
  
  // Get employee allowances
  const employeeAllowances = allowances.find(allow => allow.employeeId === employee.id) || {
    employeeId: employee.id,
    travelAllowance: 0,
    medicalAllowance: 0,
    washingAllowance: 0,
    hra: calculateHRA(employee.baseSalary),
    da: calculateDA(employee.baseSalary)
  };
  
  const totalAllowances = employeeAllowances.travelAllowance + 
                         employeeAllowances.medicalAllowance + 
                         employeeAllowances.washingAllowance + 
                         employeeAllowances.hra + 
                         employeeAllowances.da;
  
  const grossSalary = employee.baseSalary + totalAllowances;
  const leaveDeduction = calculateLeaveDeduction(employee.baseSalary, totalLeaveDays);
  const tax = calculateTax(grossSalary);
  const totalDeductions = leaveDeduction + tax;
  const netSalary = grossSalary - totalDeductions;
  
  const payrollRecord: PayrollRecord = {
    id: `payroll-${employee.id}-${month}-${year}`,
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    month,
    year,
    baseSalary: employee.baseSalary,
    allowances: {
      travel: employeeAllowances.travelAllowance,
      medical: employeeAllowances.medicalAllowance,
      washing: employeeAllowances.washingAllowance,
      hra: employeeAllowances.hra,
      da: employeeAllowances.da
    },
    deductions: {
      leaveDays: totalLeaveDays,
      leaveDeduction,
      tax
    },
    grossSalary,
    netSalary,
    generatedDate: new Date().toISOString()
  };
  
  return payrollRecord;
};