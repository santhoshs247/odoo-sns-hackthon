import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateTrip } from './pages/CreateTrip';
import { ItineraryBuilder } from './pages/ItineraryBuilder';
import { TripsList } from './pages/TripsList';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { TripDetail } from './pages/TripDetail';
import { Community } from './pages/Community';
import { Calendar } from './pages/Calendar';
import { Admin } from './pages/Admin';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    if (currentPage === 'register') {
      return <Register onNavigate={handleNavigate} />;
    }
    return <Login onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'create-trip' && <CreateTrip onNavigate={handleNavigate} />}
      {currentPage === 'itinerary-builder' && pageData?.tripId && (
        <ItineraryBuilder onNavigate={handleNavigate} tripId={pageData.tripId} />
      )}
      {currentPage === 'trips' && <TripsList onNavigate={handleNavigate} />}
      {currentPage === 'profile' && <Profile onNavigate={handleNavigate} />}
      {currentPage === 'search' && (
        <Search
          onNavigate={handleNavigate}
          initialQuery={pageData?.query}
          initialCity={pageData?.city}
        />
      )}
      {currentPage === 'trip-detail' && pageData?.tripId && (
        <TripDetail onNavigate={handleNavigate} tripId={pageData.tripId} />
      )}
      {currentPage === 'community' && <Community onNavigate={handleNavigate} />}
      {currentPage === 'calendar' && <Calendar onNavigate={handleNavigate} />}
      {currentPage === 'admin' && profile?.is_admin && <Admin onNavigate={handleNavigate} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
