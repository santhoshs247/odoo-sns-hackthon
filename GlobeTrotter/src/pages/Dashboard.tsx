import { useState, useEffect } from 'react';
import { Search, Plus, MapPin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

interface City {
  id: string;
  name: string;
  country: string;
  image_url: string;
  popularity_score: number;
}

interface Trip {
  id: string;
  name: string;
  start_place: string;
  start_date: string;
  end_date: string;
  status: string;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);

  useEffect(() => {
    fetchCities();
    fetchRecentTrips();
  }, []);

  const fetchCities = async () => {
    const { data } = await supabase
      .from('cities')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(8);
    if (data) setCities(data);
  };

  const fetchRecentTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecentTrips(data);
  };

  const handleSearch = () => {
    onNavigate('search', { query: searchQuery });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1260)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center">
            Where to next, {profile?.first_name}?
          </h1>
          <p className="text-xl text-white mb-8 text-center">
            Discover amazing destinations and plan your perfect trip
          </p>
          <div className="w-full max-w-2xl flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search cities or destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Top Destinations</h2>
          <Button onClick={() => onNavigate('create-trip')} size="sm">
            <Plus size={20} className="mr-2" />
            Plan a Trip
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cities.map((city) => (
            <Card
              key={city.id}
              hover
              onClick={() => onNavigate('search', { city: city.name })}
            >
              <div className="relative h-48">
                <img
                  src={city.image_url || 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg'}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">{city.name}</h3>
                  <p className="text-sm flex items-center mt-1">
                    <MapPin size={14} className="mr-1" />
                    {city.country}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {recentTrips.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Recent Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentTrips.map((trip) => (
                <Card
                  key={trip.id}
                  hover
                  onClick={() => onNavigate('trip-detail', { tripId: trip.id })}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.name}</h3>
                    <p className="text-gray-600 flex items-center mb-2">
                      <MapPin size={16} className="mr-2" />
                      {trip.start_place}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(trip.start_date).toLocaleDateString()} -{' '}
                      {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                    <div className="mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'completed'
                            ? 'bg-gray-100 text-gray-700'
                            : trip.status === 'ongoing'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
