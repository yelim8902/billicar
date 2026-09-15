import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useAuth } from './hooks/useAuth';
import { useLinkedWallet } from './hooks/useLinkedWallet';
import { theme } from './styles/theme';
import Layout from './components/Layout';
import OnboardingScreen from './components/OnboardingScreen';
import AuthScreen from './components/AuthScreen';
import VehicleList from './components/VehicleList';
import BookingForm from './components/BookingForm';
import ActiveRental from './components/ActiveRental';
import RegisterVehicle from './components/RegisterVehicle';
import TransactionLog from './components/TransactionLog';
import HomeDashboard from './components/HomeDashboard';
import MyPage from './components/MyPage';
import MyBookings from './components/MyBookings';
import MyVehicles from './components/MyVehicles';
import Earnings from './components/Earnings';

export default function App() {
  const auth = useAuth();
  const wallet = useWallet();
  const walletProfile = useLinkedWallet(auth.user);

  const [role,            setRole]            = useState(null);   // null | 'renter' | 'host'
  const [currentPage,     setCurrentPage]     = useState('vehicles');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [txLogs,          setTxLogs]          = useState([]);

  const addTxLog = (log) => {
    setTxLogs(prev => [{
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('ko-KR'),
      ...log,
    }, ...prev]);
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setCurrentPage(selectedRole === 'host' ? 'register' : 'home');
  };

  const handleSwitchRole = () => {
    setRole(null);
    setSelectedVehicle(null);
    setCurrentPage('home');
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentPage('book');
  };

  const handleBookingSuccess = () => {
    setCurrentPage('bookings');
  };

  const handleRentalEnd = () => {
    setCurrentPage('bookings');
  };

  // 역할 미선택 시 온보딩 화면
  if (!role) {
    return <OnboardingScreen onSelect={handleRoleSelect} />;
  }

  if (auth.loading) {
    return <LoadingScreen />;
  }

  if (!auth.isAuthenticated) {
    return <AuthScreen auth={auth} onBack={() => setRole(null)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'vehicles':
        return <VehicleList onSelect={handleVehicleSelect} />;
      case 'home':
        return <HomeDashboard wallet={wallet} onNavigate={(page) => page === 'switchHost' ? handleRoleSelect('host') : setCurrentPage(page)} />;
      case 'pickup':
        return <VehicleList mode="pickup" onBack={() => setCurrentPage('home')} onSelect={handleVehicleSelect} />;
      case 'delivery':
        return <VehicleList mode="delivery" onBack={() => setCurrentPage('home')} onSelect={handleVehicleSelect} />;
      case 'book':
        return <BookingForm userId={auth.user.id} vehicle={selectedVehicle} wallet={wallet} walletProfile={walletProfile} addTxLog={addTxLog} onSuccess={handleBookingSuccess} />;
      case 'bookings':
        return <MyBookings userId={auth.user.id} onFindVehicle={() => setCurrentPage('pickup')} onStart={() => setCurrentPage('active')} />;
      case 'active':
        return <ActiveRental userId={auth.user.id} wallet={wallet} addTxLog={addTxLog} onEnd={handleRentalEnd} />;
      case 'register':
        return <RegisterVehicle userId={auth.user.id} wallet={wallet} walletProfile={walletProfile} addTxLog={addTxLog} />;
      case 'mypage':
        return <MyPage auth={auth} wallet={wallet} walletProfile={walletProfile} onSwitchRole={handleSwitchRole} />;
      case 'myVehicles':
        return <MyVehicles userId={auth.user.id} onRegister={() => setCurrentPage('register')} />;
      case 'earnings':
        return <Earnings userId={auth.user.id} />;
      default:
        return <VehicleList onSelect={handleVehicleSelect} />;
    }
  };

  return (
    <>
      <Layout
        wallet={wallet}
        walletProfile={walletProfile}
        auth={auth}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        role={role}
        onSwitchRole={handleSwitchRole}
      >
        {renderPage()}
      </Layout>
      <TransactionLog logs={txLogs} />
    </>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'grid', placeItems: 'center',
      color: theme.colors.primary, fontSize: 16, fontWeight: 800,
    }}>
      MobiTrust
    </div>
  );
}
