import { Employee, User } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  EMPLOYEES: 'employees',
  LEAVE_REQUESTS: 'leaveRequests',
  ALLOWANCES: 'allowances',
  PAYROLL_RECORDS: 'payrollRecords'
};

// Initialize default admin user
export const initializeDefaultData = () => {
  const existingEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  
  if (!existingEmployees) {
    const defaultAdmin: Employee = {
      id: 'admin-001',
      username: 'admin',
      password: 'admin123', // In production, this would be hashed
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@company.com',
      phone: '+1234567890',
      department: 'IT',
      position: 'System Administrator',
      joinDate: '2024-01-01',
      baseSalary: 80000,
      isActive: true,
      role: 'admin'
    };

    const defaultEmployee: Employee = {
      id: 'emp-001',
      username: 'john.doe',
      password: 'emp123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1234567891',
      department: 'Engineering',
      position: 'Software Developer',
      joinDate: '2024-01-15',
      baseSalary: 65000,
      isActive: true,
      role: 'employee'
    };

    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify([defaultAdmin, defaultEmployee]));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ALLOWANCES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAYROLL_RECORDS, JSON.stringify([]));
  }
};

export const login = (username: string, password: string): User | null => {
  const employees: Employee[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
  const employee = employees.find(emp => emp.username === username && emp.password === password && emp.isActive);
  
  if (employee) {
    const user: User = {
      id: employee.id,
      username: employee.username,
      role: employee.role,
      employeeData: employee
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  
  return null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};