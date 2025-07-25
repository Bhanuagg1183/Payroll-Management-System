import React from 'react';
import { Users, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getCurrentUser, isAdmin } from '../utils/auth';
import { getEmployees, getLeaveRequests, getPayrollRecords } from '../utils/storage';

const Dashboard: React.FC = () => {
  const user = getCurrentUser();
  const isAdminUser = isAdmin();
  
  const employees = getEmployees();
  const leaveRequests = getLeaveRequests();
  const payrollRecords = getPayrollRecords();

  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const pendingLeaves = leaveRequests.filter(leave => leave.status === 'pending').length;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthPayrolls = payrollRecords.filter(record => 
    parseInt(record.month) === currentMonth && record.year === currentYear
  ).length;

  const userLeaveRequests = leaveRequests.filter(leave => leave.employeeId === user?.id);
  const userPayrolls = payrollRecords.filter(record => record.employeeId === user?.id);

  if (isAdminUser) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                <p className="text-3xl font-bold text-gray-900">{pendingLeaves}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payrolls</p>
                <p className="text-3xl font-bold text-gray-900">{currentMonthPayrolls}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leave Requests</h3>
            <div className="space-y-3">
              {leaveRequests.slice(0, 5).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{leave.employeeName}</p>
                    <p className="text-sm text-gray-600">{leave.startDate} to {leave.endDate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">System Status</span>
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Backup</span>
                <span className="text-gray-900">Today, 2:00 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Sessions</span>
                <span className="text-gray-900">{activeEmployees}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leave Requests</p>
              <p className="text-3xl font-bold text-gray-900">{userLeaveRequests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
              <p className="text-3xl font-bold text-gray-900">
                {userLeaveRequests.filter(leave => leave.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Salary Records</p>
              <p className="text-3xl font-bold text-gray-900">{userPayrolls.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Leave Requests</h3>
          <div className="space-y-3">
            {userLeaveRequests.slice(0, 5).map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{leave.reason}</p>
                  <p className="text-sm text-gray-600">{leave.startDate} to {leave.endDate}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                  leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Department</span>
              <span className="text-gray-900">{user?.employeeData?.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Position</span>
              <span className="text-gray-900">{user?.employeeData?.position}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Join Date</span>
              <span className="text-gray-900">{user?.employeeData?.joinDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Employee ID</span>
              <span className="text-gray-900">{user?.employeeData?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;