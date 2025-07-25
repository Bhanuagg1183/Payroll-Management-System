import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Calculator, Download } from 'lucide-react';
import { Employee, Allowance, PayrollRecord } from '../types';
import { getEmployees, getAllowances, saveAllowance, getPayrollRecords, savePayrollRecord } from '../utils/storage';
import { generatePayroll, calculateHRA, calculateDA } from '../utils/payroll';
import { getCurrentUser, isAdmin } from '../utils/auth';

const PayrollManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [showAllowanceForm, setShowAllowanceForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [allowanceFormData, setAllowanceFormData] = useState({
    travelAllowance: 0,
    medicalAllowance: 0,
    washingAllowance: 0
  });

  const user = getCurrentUser();
  const isAdminUser = isAdmin();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployees(getEmployees());
    setAllowances(getAllowances());
    setPayrollRecords(getPayrollRecords());
  };

  const handleAllowanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;

    const allowance: Allowance = {
      employeeId: selectedEmployee.id,
      travelAllowance: allowanceFormData.travelAllowance,
      medicalAllowance: allowanceFormData.medicalAllowance,
      washingAllowance: allowanceFormData.washingAllowance,
      hra: calculateHRA(selectedEmployee.baseSalary),
      da: calculateDA(selectedEmployee.baseSalary)
    };

    saveAllowance(allowance);
    loadData();
    setShowAllowanceForm(false);
    setSelectedEmployee(null);
    setAllowanceFormData({ travelAllowance: 0, medicalAllowance: 0, washingAllowance: 0 });
  };

  const generateMonthlyPayroll = (employeeId: string, month: string, year: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const payrollRecord = generatePayroll(employee, month, year);
    savePayrollRecord(payrollRecord);
    loadData();
  };

  const generateAllPayrolls = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    employees.forEach(employee => {
      if (employee.isActive) {
        const payrollRecord = generatePayroll(employee, currentMonth.toString(), currentYear);
        savePayrollRecord(payrollRecord);
      }
    });
    
    loadData();
    alert('Payroll generated for all active employees!');
  };

  const filteredPayrollRecords = isAdminUser 
    ? payrollRecords 
    : payrollRecords.filter(record => record.employeeId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdminUser ? 'Payroll Management' : 'My Salary Details'}
        </h2>
        {isAdminUser && (
          <div className="flex gap-2">
            <button
              onClick={generateAllPayrolls}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calculator className="w-5 h-5" />
              Generate All Payrolls
            </button>
          </div>
        )}
      </div>

      {isAdminUser && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Allowances</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Travel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medical</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Washing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HRA</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DA</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.filter(emp => emp.isActive).map((employee) => {
                    const employeeAllowance = allowances.find(allow => allow.employeeId === employee.id);
                    const hra = calculateHRA(employee.baseSalary);
                    const da = calculateDA(employee.baseSalary);
                    
                    return (
                      <tr key={employee.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${employee.baseSalary.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${employeeAllowance?.travelAllowance || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${employeeAllowance?.medicalAllowance || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${employeeAllowance?.washingAllowance || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">${hra}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${da}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                if (employeeAllowance) {
                                  setAllowanceFormData({
                                    travelAllowance: employeeAllowance.travelAllowance,
                                    medicalAllowance: employeeAllowance.medicalAllowance,
                                    washingAllowance: employeeAllowance.washingAllowance
                                  });
                                }
                                setShowAllowanceForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit Allowances
                            </button>
                            <button
                              onClick={() => generateMonthlyPayroll(employee.id, (new Date().getMonth() + 1).toString(), new Date().getFullYear())}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Generate Payroll
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {showAllowanceForm && selectedEmployee && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Set Allowances for {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                </div>
                
                <form onSubmit={handleAllowanceSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel Allowance</label>
                    <input
                      type="number"
                      value={allowanceFormData.travelAllowance}
                      onChange={(e) => setAllowanceFormData({...allowanceFormData, travelAllowance: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Allowance</label>
                    <input
                      type="number"
                      value={allowanceFormData.medicalAllowance}
                      onChange={(e) => setAllowanceFormData({...allowanceFormData, medicalAllowance: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Washing Allowance</label>
                    <input
                      type="number"
                      value={allowanceFormData.washingAllowance}
                      onChange={(e) => setAllowanceFormData({...allowanceFormData, washingAllowance: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Auto-calculated:</strong><br />
                      HRA: ${calculateHRA(selectedEmployee.baseSalary)}<br />
                      DA: ${calculateDA(selectedEmployee.baseSalary)}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllowanceForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Allowances
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isAdminUser ? 'Payroll Records' : 'My Salary Records'}
          </h3>
        </div>
        
        {filteredPayrollRecords.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payroll records found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayrollRecords.map((record) => (
              <div key={record.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {isAdminUser ? record.employeeName : 'Salary Slip'}
                    </h4>
                    <p className="text-gray-600">
                      {new Date(0, parseInt(record.month) - 1).toLocaleString('default', { month: 'long' })} {record.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${record.netSalary.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Net Salary</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Earnings</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Base Salary:</span>
                        <span>${record.baseSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HRA:</span>
                        <span>${record.allowances.hra}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DA:</span>
                        <span>${record.allowances.da}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Travel:</span>
                        <span>${record.allowances.travel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical:</span>
                        <span>${record.allowances.medical}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Washing:</span>
                        <span>${record.allowances.washing}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Gross:</span>
                        <span>${record.grossSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Deductions</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Leave Deduction ({record.deductions.leaveDays} days):</span>
                        <span>${record.deductions.leaveDeduction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${record.deductions.tax}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total:</span>
                        <span>${(record.deductions.leaveDeduction + record.deductions.tax).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Summary</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Gross Salary:</span>
                        <span>${record.grossSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Deductions:</span>
                        <span>${(record.deductions.leaveDeduction + record.deductions.tax).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-1">
                        <span>Net Salary:</span>
                        <span className="text-green-600">${record.netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollManagement;