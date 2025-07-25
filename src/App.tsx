import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import LeaveManagement from './components/LeaveManagement';
import PayrollManagement from './components/PayrollManagement';
import Reports from './components/Reports';
import Profile from './components/Profile';
import { initializeDefaultData, isAuthenticated, isAdmin } from './utils/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    initializeDefaultData();
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLogin = (success: boolean) => {
    setIsLoggedIn(success);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return isAdmin() ? <EmployeeManagement /> : <Dashboard />;
      case 'leaves':
        return <LeaveManagement />;
      case 'payroll':
        return isAdmin() ? <PayrollManagement /> : <PayrollManagement />;
      case 'salary':
        return <PayrollManagement />;
      case 'reports':
        return isAdmin() ? <Reports /> : <Dashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;