import { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TripsListProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Trip {
  id: string;
  name: string;
  start_place: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  total_budget: number;
}

export function TripsList({ onNavigate }: TripsListProps) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    fetchTrips();
  }, [filter, sortBy]);

  const fetchTrips = async () => {
    if (!user) return;

    let query = supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    if (sortBy === 'date') {
      query = query.order('start_date', { ascending: false });
    } else if (sortBy === 'name') {
      query = query.order('name');
    }

    const { data } = await query;
    if (data) setTrips(data);
  };

  const groupedTrips = {
    ongoing: trips.filter((t) => t.status === 'ongoing'),
    upcoming: trips.filter((t) => t.status === 'upcoming'),
    completed: trips.filter((t) => t.status === 'completed'),
  };

  const renderTripCard = (trip: Trip) => (
    <Card key={trip.id} hover onClick={() => onNavigate('trip-detail', { tripId: trip.id })}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{trip.name}</h3>
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

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span className="text-sm">{trip.start_place}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span className="text-sm">
              {new Date(trip.start_date).toLocaleDateString()} -{' '}
              {new Date(trip.end_date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <DollarSign size={16} className="mr-2" />
            <span className="text-sm">Budget: ${trip.total_budget}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Trips</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="text-gray-600 mr-2" size={20} />
            <span className="font-semibold text-gray-700">Filter & Sort</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filter by Status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Trips' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'ongoing', label: 'Ongoing' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
            <Select
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'date', label: 'Date' },
                { value: 'name', label: 'Name' },
              ]}
            />
          </div>
        </div>

        {filter === 'all' ? (
          <>
            {groupedTrips.ongoing.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ongoing Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.ongoing.map(renderTripCard)}
                </div>
              </div>
            )}

            {groupedTrips.upcoming.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.upcoming.map(renderTripCard)}
                </div>
              </div>
            )}

            {groupedTrips.completed.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Completed Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.completed.map(renderTripCard)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(renderTripCard)}
          </div>
        )}

        {trips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No trips found</p>
          </div>
        )}
      </div>
    </div>
  );
}
