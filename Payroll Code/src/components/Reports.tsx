import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { getEmployees, getLeaveRequests, getPayrollRecords } from '../utils/storage';
import { Employee, LeaveRequest, PayrollRecord } from '../types';

const Reports: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    setEmployees(getEmployees());
    setLeaveRequests(getLeaveRequests());
    setPayrollRecords(getPayrollRecords());
  }, []);

  const generateMonthlyReport = () => {
    const monthlyPayrolls = payrollRecords.filter(record => 
      record.year === selectedYear && parseInt(record.month) === selectedMonth
    );

    if (monthlyPayrolls.length === 0) {
      alert('No payroll data found for the selected month/year');
      return;
    }

    const totalGross = monthlyPayrolls.reduce((sum, record) => sum + record.grossSalary, 0);
    const totalNet = monthlyPayrolls.reduce((sum, record) => sum + record.netSalary, 0);
    const totalDeductions = totalGross - totalNet;

    const reportContent = `
MONTHLY SALARY REPORT
Month: ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}
Generated: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Employees: ${monthlyPayrolls.length}
- Total Gross Salary: $${totalGross.toLocaleString()}
- Total Deductions: $${totalDeductions.toLocaleString()}
- Total Net Salary: $${totalNet.toLocaleString()}

EMPLOYEE DETAILS:
${monthlyPayrolls.map(record => `
Employee: ${record.employeeName}
Gross Salary: $${record.grossSalary.toLocaleString()}
Net Salary: $${record.netSalary.toLocaleString()}
Leave Days: ${record.deductions.leaveDays}
`).join('\n')}
    `;

    downloadReport(reportContent, `monthly-salary-report-${selectedMonth}-${selectedYear}.txt`);
  };

  const generateYearlyReport = () => {
    const yearlyPayrolls = payrollRecords.filter(record => record.year === selectedYear);

    if (yearlyPayrolls.length === 0) {
      alert('No payroll data found for the selected year');
      return;
    }

    const totalGross = yearlyPayrolls.reduce((sum, record) => sum + record.grossSalary, 0);
    const totalNet = yearlyPayrolls.reduce((sum, record) => sum + record.netSalary, 0);
    const totalDeductions = totalGross - totalNet;

    const monthlyBreakdown = Array.from({length: 12}, (_, i) => {
      const month = i + 1;
      const monthRecords = yearlyPayrolls.filter(record => parseInt(record.month) === month);
      const monthGross = monthRecords.reduce((sum, record) => sum + record.grossSalary, 0);
      const monthNet = monthRecords.reduce((sum, record) => sum + record.netSalary, 0);
      
      return {
        month: new Date(0, i).toLocaleString('default', { month: 'long' }),
        employees: monthRecords.length,
        gross: monthGross,
        net: monthNet
      };
    }).filter(month => month.employees > 0);

    const reportContent = `
YEARLY SALARY REPORT
Year: ${selectedYear}
Generated: ${new Date().toLocaleDateString()}

ANNUAL SUMMARY:
- Total Payroll Records: ${yearlyPayrolls.length}
- Total Gross Salary: $${totalGross.toLocaleString()}
- Total Deductions: $${totalDeductions.toLocaleString()}
- Total Net Salary: $${totalNet.toLocaleString()}

MONTHLY BREAKDOWN:
${monthlyBreakdown.map(month => `
${month.month}:
  Employees: ${month.employees}
  Gross: $${month.gross.toLocaleString()}
  Net: $${month.net.toLocaleString()}
`).join('\n')}
    `;

    downloadReport(reportContent, `yearly-salary-report-${selectedYear}.txt`);
  };

  const generateEmployeeReport = () => {
    const employeeData = employees.map(employee => {
      const employeePayrolls = payrollRecords.filter(record => record.employeeId === employee.id);
      const employeeLeaves = leaveRequests.filter(leave => leave.employeeId === employee.id);
      
      const totalGross = employeePayrolls.reduce((sum, record) => sum + record.grossSalary, 0);
      const totalNet = employeePayrolls.reduce((sum, record) => sum + record.netSalary, 0);
      const totalLeaves = employeeLeaves.reduce((sum, leave) => sum + leave.days, 0);
      const approvedLeaves = employeeLeaves.filter(leave => leave.status === 'approved').reduce((sum, leave) => sum + leave.days, 0);

      return {
        employee,
        payrollCount: employeePayrolls.length,
        totalGross,
        totalNet,
        totalLeaves,
        approvedLeaves
      };
    });

    const reportContent = `
EMPLOYEE-WISE SALARY REPORT
Generated: ${new Date().toLocaleDateString()}

${employeeData.map(data => `
EMPLOYEE: ${data.employee.firstName} ${data.employee.lastName}
Employee ID: ${data.employee.id}
Department: ${data.employee.department}
Position: ${data.employee.position}
Base Salary: $${data.employee.baseSalary.toLocaleString()}
Status: ${data.employee.isActive ? 'Active' : 'Inactive'}

Payroll Records: ${data.payrollCount}
Total Gross Earned: $${data.totalGross.toLocaleString()}
Total Net Earned: $${data.totalNet.toLocaleString()}
Total Leave Days: ${data.totalLeaves}
Approved Leave Days: ${data.approvedLeaves}
${'='.repeat(50)}
`).join('\n')}
    `;

    downloadReport(reportContent, `employee-wise-salary-report.txt`);
  };

  const generateLeaveReport = () => {
    const leaveData = employees.map(employee => {
      const employeeLeaves = leaveRequests.filter(leave => leave.employeeId === employee.id);
      const approvedLeaves = employeeLeaves.filter(leave => leave.status === 'approved');
      const pendingLeaves = employeeLeaves.filter(leave => leave.status === 'pending');
      const rejectedLeaves = employeeLeaves.filter(leave => leave.status === 'rejected');

      return {
        employee,
        totalRequests: employeeLeaves.length,
        approved: approvedLeaves.length,
        pending: pendingLeaves.length,
        rejected: rejectedLeaves.length,
        totalDays: approvedLeaves.reduce((sum, leave) => sum + leave.days, 0)
      };
    });

    const reportContent = `
LEAVE REPORT
Generated: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Leave Requests: ${leaveRequests.length}
- Approved: ${leaveRequests.filter(leave => leave.status === 'approved').length}
- Pending: ${leaveRequests.filter(leave => leave.status === 'pending').length}
- Rejected: ${leaveRequests.filter(leave => leave.status === 'rejected').length}

EMPLOYEE-WISE LEAVE DETAILS:
${leaveData.map(data => `
Employee: ${data.employee.firstName} ${data.employee.lastName}
Department: ${data.employee.department}
Total Requests: ${data.totalRequests}
Approved: ${data.approved}
Pending: ${data.pending}
Rejected: ${data.rejected}
Total Approved Days: ${data.totalDays}
`).join('\n')}

DETAILED LEAVE REQUESTS:
${leaveRequests.map(leave => `
Employee: ${leave.employeeName}
Period: ${leave.startDate} to ${leave.endDate}
Days: ${leave.days}
Reason: ${leave.reason}
Status: ${leave.status.toUpperCase()}
Applied: ${leave.appliedDate}
${leave.adminNotes ? `Admin Notes: ${leave.adminNotes}` : ''}
${'='.repeat(30)}
`).join('\n')}
    `;

    downloadReport(reportContent, `leave-report.txt`);
  };

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentMonthPayrolls = payrollRecords.filter(record => 
    record.year === new Date().getFullYear() && parseInt(record.month) === new Date().getMonth() + 1
  );

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const totalLeaveRequests = leaveRequests.length;
  const pendingLeaves = leaveRequests.filter(leave => leave.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leave Requests</p>
              <p className="text-3xl font-bold text-gray-900">{totalLeaveRequests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
              <p className="text-3xl font-bold text-gray-900">{pendingLeaves}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Salary Report</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[2023, 2024, 2025].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={generateMonthlyReport}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Generate Monthly Report
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Salary Report</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateYearlyReport}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Generate Yearly Report
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee-wise Report</h3>
          <p className="text-gray-600 mb-4">Generate comprehensive report for all employees including salary and leave details.</p>
          <button
            onClick={generateEmployeeReport}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Generate Employee Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Report</h3>
          <p className="text-gray-600 mb-4">Generate detailed report of all leave requests and their status.</p>
          <button
            onClick={generateLeaveReport}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Generate Leave Report
          </button>
        </div>
      </div>

      {currentMonthPayrolls.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Month Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{currentMonthPayrolls.length}</p>
              <p className="text-sm text-gray-600">Payrolls Generated</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                ${currentMonthPayrolls.reduce((sum, record) => sum + record.grossSalary, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Gross Salary</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                ${currentMonthPayrolls.reduce((sum, record) => sum + record.netSalary, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Net Salary</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;