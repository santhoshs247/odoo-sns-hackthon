import { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateTripProps {
  onNavigate: (page: string, data?: any) => void;
}

interface ActivitySuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_cost: number;
}

export function CreateTrip({ onNavigate }: CreateTripProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    startPlace: '',
    startDate: '',
    endDate: '',
  });
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from('activity_suggestions')
      .select('*')
      .limit(6);
    if (data) setSuggestions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('No user logged in');

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: formData.name,
          start_place: formData.startPlace,
          start_date: formData.startDate,
          end_date: formData.endDate,
          status: 'upcoming',
        })
        .select()
        .single();

      if (tripError) throw tripError;

      onNavigate('itinerary-builder', { tripId: trip.id });
    } catch (err) {
      setError('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Plan Your Next Trip</h1>
          <p className="text-gray-600 mb-8">
            Let's start by getting some basic information about your trip
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="name"
              label="Trip Name"
              placeholder="Summer in Europe"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              type="text"
              name="startPlace"
              label="Starting Location"
              placeholder="Paris, France"
              value={formData.startPlace}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                name="startDate"
                label="Start Date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <Input
                type="date"
                name="endDate"
                label="End Date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating trip...' : 'Continue to Itinerary'}
            </Button>
          </form>
        </div>

        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="text-yellow-500 mr-2" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Popular Activities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{suggestion.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {suggestion.category}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      ${suggestion.estimated_cost}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
