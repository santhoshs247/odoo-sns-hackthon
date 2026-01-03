import { useState, useEffect } from 'react';
import { MapPin, Calendar, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';

interface CommunityProps {
  onNavigate: (page: string, data?: any) => void;
}

interface PublicTrip {
  id: string;
  name: string;
  start_place: string;
  start_date: string;
  end_date: string;
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
    profile_photo_url: string | null;
  };
}

export function Community({ onNavigate }: CommunityProps) {
  const [publicTrips, setPublicTrips] = useState<PublicTrip[]>([]);

  useEffect(() => {
    fetchPublicTrips();
  }, []);

  const fetchPublicTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          profile_photo_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setPublicTrips(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Trips</h1>
          <p className="text-gray-600">
            Explore trips shared by the GlobeTrotter community for inspiration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicTrips.map((trip) => (
            <Card
              key={trip.id}
              hover
              onClick={() => onNavigate('trip-detail', { tripId: trip.id })}
            >
              <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-teal-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white text-center px-4">
                    {trip.name}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    {trip.profiles?.profile_photo_url ? (
                      <img
                        src={trip.profiles.profile_photo_url}
                        alt="User"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        {trip.profiles?.first_name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {trip.profiles?.first_name} {trip.profiles?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">Shared a trip</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center text-sm">
                    <MapPin size={16} className="mr-2" />
                    {trip.start_place}
                  </p>
                  <p className="text-gray-600 flex items-center text-sm">
                    <Calendar size={16} className="mr-2" />
                    {new Date(trip.start_date).toLocaleDateString()} -{' '}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  className="mt-4"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => onNavigate('trip-detail', { tripId: trip.id })}
                >
                  <Eye size={16} className="mr-2" />
                  View Itinerary
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {publicTrips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No public trips yet. Be the first to share your adventure!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Button({ children, className = '', ...props }: any) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
