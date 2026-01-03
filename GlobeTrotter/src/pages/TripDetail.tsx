import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, DollarSign, Edit2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

interface TripDetailProps {
  onNavigate: (page: string, data?: any) => void;
  tripId: string;
}

interface Trip {
  id: string;
  name: string;
  start_place: string;
  start_date: string;
  end_date: string;
  status: string;
  total_budget: number;
}

interface Section {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  budget: number;
}

interface Activity {
  id: string;
  section_id: string;
  name: string;
  description: string;
  expense: number;
  category: string;
}

export function TripDetail({ onNavigate, tripId }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    const { data: tripData } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    const { data: sectionsData } = await supabase
      .from('itinerary_sections')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index');

    const { data: activitiesData } = await supabase
      .from('activities')
      .select('*')
      .in('section_id', sectionsData?.map((s) => s.id) || [])
      .order('order_index');

    if (tripData) setTrip(tripData);
    if (sectionsData) setSections(sectionsData);
    if (activitiesData) {
      setActivities(activitiesData);
      const total = activitiesData.reduce((sum, a) => sum + (a.expense || 0), 0);
      setTotalExpenses(total);
    }
  };

  const getSectionActivities = (sectionId: string) => {
    return activities.filter((a) => a.section_id === sectionId);
  };

  const getSectionTotal = (sectionId: string) => {
    return getSectionActivities(sectionId).reduce((sum, a) => sum + (a.expense || 0), 0);
  };

  if (!trip) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => onNavigate('trips')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Trips
        </button>

        <Card className="mb-8">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{trip.name}</h1>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center">
                    <MapPin size={20} className="mr-2" />
                    {trip.start_place}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <Calendar size={20} className="mr-2" />
                    {new Date(trip.start_date).toLocaleDateString()} -{' '}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button onClick={() => onNavigate('itinerary-builder', { tripId })} variant="outline">
                <Edit2 size={16} className="mr-2" />
                Edit Itinerary
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-gray-800">${trip.total_budget}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-emerald-600">${totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${trip.total_budget - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(trip.total_budget - totalExpenses).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Itinerary</h2>

        <div className="space-y-6">
          {sections.map((section) => {
            const sectionActivities = getSectionActivities(section.id);
            const sectionTotal = getSectionTotal(section.id);

            return (
              <Card key={section.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(section.start_date).toLocaleDateString()} -{' '}
                        {new Date(section.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Section Budget</p>
                      <p className="text-lg font-bold text-gray-800">${section.budget}</p>
                      <p className="text-sm text-emerald-600">Spent: ${sectionTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  {sectionActivities.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {sectionActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                            {activity.description && (
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            )}
                            {activity.category && (
                              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                {activity.category}
                              </span>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-gray-800">
                              ${activity.expense.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No activities added yet</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No itinerary sections yet</p>
            <Button onClick={() => onNavigate('itinerary-builder', { tripId })}>
              Build Itinerary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
