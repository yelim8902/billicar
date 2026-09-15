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
import { Screen } from './components/ui/Primitives';

export default function App() {
  const auth = useAuth();
  const wallet = useWallet();
  const walletProfile = useLinkedWallet(auth.user);

  const [role,            setRole]            = useState(null);   // null | 'renter' | 'host'
  const [currentPage,     setCurrentPage]     = useState('vehicles');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeRental,    setActiveRental]    = useState(null);
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
    setActiveRental(null);
    setCurrentPage('home');
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentPage('book');
  };

  const handleBookingSuccess = (rental) => {
    setActiveRental(rental);
    setCurrentPage('active');
  };

  const handleRentalEnd = () => {
    setActiveRental(null);
    setCurrentPage('vehicles');
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
        return <BookingForm vehicle={selectedVehicle} wallet={wallet} addTxLog={addTxLog} onSuccess={handleBookingSuccess} />;
      case 'active':
        return <ActiveRental rental={activeRental} wallet={wallet} addTxLog={addTxLog} onEnd={handleRentalEnd} />;
      case 'register':
        return <RegisterVehicle wallet={wallet} addTxLog={addTxLog} />;
      case 'myVehicles':
      case 'earnings':
        return <ComingSoon label={currentPage === 'myVehicles' ? '내 차량 관리' : '수익 현황'} />;
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

function ComingSoon({ label }) {
  return (
    <Screen>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '72px 20px', textAlign: 'center',
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 99, background: theme.colors.primary, marginBottom: 24 }} />
        <p style={{ fontSize: 17, fontWeight: 800, color: theme.colors.text, marginBottom: 8 }}>{label}</p>
        <p style={{
          fontSize: 12, fontWeight: 700, color: theme.colors.textSecondary,
          background: theme.colors.surfaceMuted, padding: '6px 16px', borderRadius: 999,
        }}>COMING SOON</p>
      </div>
    </Screen>
  );
}
