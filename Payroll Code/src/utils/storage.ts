import { Employee, LeaveRequest, Allowance, PayrollRecord } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  LEAVE_REQUESTS: 'leaveRequests',
  ALLOWANCES: 'allowances',
  PAYROLL_RECORDS: 'payrollRecords'
};

// Employee operations
export const getEmployees = (): Employee[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
};

export const saveEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === employee.id);
  
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const deleteEmployee = (employeeId: string): void => {
  const employees = getEmployees();
  const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filteredEmployees));
};

// Leave request operations
export const getLeaveRequests = (): LeaveRequest[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS) || '[]');
};

export const saveLeaveRequest = (leaveRequest: LeaveRequest): void => {
  const requests = getLeaveRequests();
  const index = requests.findIndex(req => req.id === leaveRequest.id);
  
  if (index >= 0) {
    requests[index] = leaveRequest;
  } else {
    requests.push(leaveRequest);
  }
  
  localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
};

// Allowance operations
export const getAllowances = (): Allowance[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOWANCES) || '[]');
};

export const saveAllowance = (allowance: Allowance): void => {
  const allowances = getAllowances();
  const index = allowances.findIndex(allow => allow.employeeId === allowance.employeeId);
  
  if (index >= 0) {
    allowances[index] = allowance;
  } else {
    allowances.push(allowance);
  }
  
  localStorage.setItem(STORAGE_KEYS.ALLOWANCES, JSON.stringify(allowances));
};

// Payroll operations
export const getPayrollRecords = (): PayrollRecord[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYROLL_RECORDS) || '[]');
};

export const savePayrollRecord = (payrollRecord: PayrollRecord): void => {
  const records = getPayrollRecords();
  const index = records.findIndex(rec => rec.id === payrollRecord.id);
  
  if (index >= 0) {
    records[index] = payrollRecord;
  } else {
    records.push(payrollRecord);
  }
  
  localStorage.setItem(STORAGE_KEYS.PAYROLL_RECORDS, JSON.stringify(records));
};