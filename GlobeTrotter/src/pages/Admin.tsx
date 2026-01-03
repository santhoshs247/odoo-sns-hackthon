import { useState, useEffect } from 'react';
import { Users, Map, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';

interface AdminProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Stats {
  totalUsers: number;
  totalTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  totalBudget: number;
}

interface PopularCity {
  name: string;
  country: string;
  trip_count: number;
}

export function Admin({ onNavigate }: AdminProps) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalBudget: 0,
  });
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { data: trips } = await supabase.from('trips').select('*');

    const upcomingCount = trips?.filter((t) => t.status === 'upcoming').length || 0;
    const completedCount = trips?.filter((t) => t.status === 'completed').length || 0;
    const totalBudget = trips?.reduce((sum, t) => sum + (t.total_budget || 0), 0) || 0;

    setStats({
      totalUsers: usersCount || 0,
      totalTrips: trips?.length || 0,
      upcomingTrips: upcomingCount,
      completedTrips: completedCount,
      totalBudget,
    });

    const cityCount: { [key: string]: { name: string; country: string; count: number } } = {};
    trips?.forEach((trip) => {
      const key = trip.start_place;
      if (cityCount[key]) {
        cityCount[key].count++;
      } else {
        cityCount[key] = { name: trip.start_place, country: '', count: 1 };
      }
    });

    const sortedCities = Object.values(cityCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => ({ name: c.name, country: c.country, trip_count: c.count }));

    setPopularCities(sortedCities);

    const { data: recentTrips } = await supabase
      .from('trips')
      .select('*, profiles:user_id(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    setRecentActivity(recentTrips || []);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="text-emerald-600" size={32} />
                <span className="text-3xl font-bold text-gray-800">{stats.totalUsers}</span>
              </div>
              <p className="text-gray-600 font-medium">Total Users</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Map className="text-blue-600" size={32} />
                <span className="text-3xl font-bold text-gray-800">{stats.totalTrips}</span>
              </div>
              <p className="text-gray-600 font-medium">Total Trips</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-orange-600" size={32} />
                <span className="text-3xl font-bold text-gray-800">{stats.upcomingTrips}</span>
              </div>
              <p className="text-gray-600 font-medium">Upcoming Trips</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="text-green-600" size={32} />
                <span className="text-3xl font-bold text-gray-800">
                  ${stats.totalBudget.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Total Budget Planned</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Destinations</h2>
              <div className="space-y-4">
                {popularCities.map((city, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-emerald-700 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{city.name}</p>
                        {city.country && (
                          <p className="text-sm text-gray-600">{city.country}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-700">{city.trip_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Trip Status Distribution</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Upcoming</span>
                    <span className="font-semibold text-gray-800">{stats.upcomingTrips}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${(stats.upcomingTrips / stats.totalTrips) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-gray-800">{stats.completedTrips}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-600 h-3 rounded-full"
                      style={{
                        width: `${(stats.completedTrips / stats.totalTrips) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Ongoing</span>
                    <span className="font-semibold text-gray-800">
                      {stats.totalTrips - stats.upcomingTrips - stats.completedTrips}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-emerald-600 h-3 rounded-full"
                      style={{
                        width: `${
                          ((stats.totalTrips - stats.upcomingTrips - stats.completedTrips) /
                            stats.totalTrips) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {activity.profiles?.first_name} {activity.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created trip: {activity.name} to {activity.start_place}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
