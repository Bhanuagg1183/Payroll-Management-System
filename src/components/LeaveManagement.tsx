import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Check, X, Clock } from 'lucide-react';
import { LeaveRequest } from '../types';
import { getLeaveRequests, saveLeaveRequest } from '../utils/storage';
import { getCurrentUser, isAdmin } from '../utils/auth';

const LeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const user = getCurrentUser();
  const isAdminUser = isAdmin();

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = () => {
    const requests = getLeaveRequests();
    setLeaveRequests(requests);
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const days = calculateDays(formData.startDate, formData.endDate);
    
    const leaveRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: user!.id,
      employeeName: `${user!.employeeData!.firstName} ${user!.employeeData!.lastName}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      days
    };

    saveLeaveRequest(leaveRequest);
    loadLeaveRequests();
    setFormData({ startDate: '', endDate: '', reason: '' });
    setShowForm(false);
  };

  const handleStatusUpdate = (requestId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    const requests = getLeaveRequests();
    const updatedRequests = requests.map(request => 
      request.id === requestId 
        ? { ...request, status, adminNotes }
        : request
    );
    
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
    loadLeaveRequests();
  };

  const filteredRequests = isAdminUser 
    ? leaveRequests 
    : leaveRequests.filter(request => request.employeeId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdminUser ? 'Leave Requests Management' : 'My Leave Requests'}
        </h2>
        {!isAdminUser && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Apply for Leave
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Apply for Leave</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for leave..."
                  required
                />
              </div>

              {formData.startDate && formData.endDate && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Total days: {calculateDays(formData.startDate, formData.endDate)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isAdminUser ? request.employeeName : 'Leave Request'}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Duration:</span> {request.startDate} to {request.endDate}
                    </div>
                    <div>
                      <span className="font-medium">Days:</span> {request.days}
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span> {request.appliedDate}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Reason:</span>
                    <p className="text-gray-600 mt-1">{request.reason}</p>
                  </div>

                  {request.adminNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Admin Notes:</span>
                      <p className="text-gray-600 mt-1">{request.adminNotes}</p>
                    </div>
                  )}
                </div>

                {isAdminUser && request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'approved')}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Enter rejection reason (optional):');
                        handleStatusUpdate(request.id, 'rejected', notes || undefined);
                      }}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;