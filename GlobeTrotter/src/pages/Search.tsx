import { useState, useEffect } from 'react';
import { Search as SearchIcon, Plus } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

interface SearchProps {
  onNavigate: (page: string, data?: any) => void;
  initialQuery?: string;
  initialCity?: string;
}

interface City {
  id: string;
  name: string;
  country: string;
  image_url: string;
}

interface ActivitySuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_cost: number;
}

export function Search({ onNavigate, initialQuery = '', initialCity = '' }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [category, setCategory] = useState('all');
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<ActivitySuggestion[]>([]);

  useEffect(() => {
    fetchCities();
    fetchActivities();
  }, [category, selectedCity]);

  const fetchCities = async () => {
    let query = supabase.from('cities').select('*');

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data } = await query.order('popularity_score', { ascending: false });
    if (data) setCities(data);
  };

  const fetchActivities = async () => {
    let query = supabase.from('activity_suggestions').select('*, cities(name)');

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data } = await query.order('popularity', { ascending: false });
    if (data) setActivities(data);
  };

  const handleSearch = () => {
    fetchCities();
    fetchActivities();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Explore Destinations & Activities</h1>

        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Sightseeing', label: 'Sightseeing' },
                  { value: 'Culture', label: 'Culture' },
                  { value: 'Leisure', label: 'Leisure' },
                  { value: 'Adventure', label: 'Adventure' },
                  { value: 'Food', label: 'Food' },
                ]}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </Card>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city) => (
              <Card key={city.id} hover>
                <div className="relative h-48">
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{city.name}</h3>
                    <p className="text-sm">{city.country}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Activities & Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{activity.name}</h3>
                    <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {activity.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      ${activity.estimated_cost}
                    </span>
                    <Button size="sm" variant="outline">
                      <Plus size={16} className="mr-1" />
                      Add to Trip
                    </Button>
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
