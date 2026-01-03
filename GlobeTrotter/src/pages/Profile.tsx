import { useState, useEffect } from 'react';
import { Edit2, User, MapPin, Phone, Mail } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Trip {
  id: string;
  name: string;
  start_place: string;
  start_date: string;
  end_date: string;
  status: string;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { profile, updateProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    country: '',
    profile_photo_url: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || '',
        city: profile.city || '',
        country: profile.country || '',
        profile_photo_url: profile.profile_photo_url || '',
      });
    }
    fetchTrips();
  }, [profile]);

  const fetchTrips = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });
    if (data) setTrips(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const completedTrips = trips.filter((t) => t.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mr-6">
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-emerald-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <div className="space-y-1 mt-2">
                    <p className="text-gray-600 flex items-center">
                      <Mail size={16} className="mr-2" />
                      {profile?.email}
                    </p>
                    {profile?.phone && (
                      <p className="text-gray-600 flex items-center">
                        <Phone size={16} className="mr-2" />
                        {profile.phone}
                      </p>
                    )}
                    {profile?.city && (
                      <p className="text-gray-600 flex items-center">
                        <MapPin size={16} className="mr-2" />
                        {profile.city}, {profile.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit2 size={16} className="mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Trips</h2>
          {upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingTrips.map((trip) => (
                <Card key={trip.id} hover onClick={() => onNavigate('trip-detail', { tripId: trip.id })}>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.name}</h3>
                    <p className="text-gray-600 mb-1">{trip.start_place}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(trip.start_date).toLocaleDateString()} -{' '}
                      {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming trips</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous Trips</h2>
          {completedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTrips.map((trip) => (
                <Card key={trip.id} hover onClick={() => onNavigate('trip-detail', { tripId: trip.id })}>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.name}</h3>
                    <p className="text-gray-600 mb-1">{trip.start_place}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(trip.start_date).toLocaleDateString()} -{' '}
                      {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No previous trips</p>
          )}
        </div>
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Profile Photo URL"
            type="url"
            value={formData.profile_photo_url}
            onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
