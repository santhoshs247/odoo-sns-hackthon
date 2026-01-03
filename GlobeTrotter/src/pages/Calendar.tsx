import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CalendarProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Trip {
  id: string;
  name: string;
  start_place: string;
  start_date: string;
  end_date: string;
}

interface Section {
  id: string;
  trip_id: string;
  title: string;
  start_date: string;
  end_date: string;
}

export function Calendar({ onNavigate }: CalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTripsAndSections();
  }, []);

  const fetchTripsAndSections = async () => {
    if (!user) return;

    const { data: tripsData } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id);

    const { data: sectionsData } = await supabase
      .from('itinerary_sections')
      .select('*')
      .in('trip_id', tripsData?.map((t) => t.id) || []);

    if (tripsData) setTrips(tripsData);
    if (sectionsData) setSections(sectionsData);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const hasEventOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return trips.some((trip) => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      return date >= start && date <= end;
    }) || sections.some((section) => {
      const start = new Date(section.start_date);
      const end = new Date(section.end_date);
      return date >= start && date <= end;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const tripsOnDate = trips.filter((trip) => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      return date >= start && date <= end;
    });
    return tripsOnDate;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (hasEventOnDate(date)) {
      setSelectedDate(date);
      setShowModal(true);
    }
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const hasEvent = hasEventOnDate(date);
    const isToday = new Date().toDateString() === date.toDateString();

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`aspect-square p-2 rounded-lg border transition-all ${
          hasEvent
            ? 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200'
            : 'border-gray-200 hover:bg-gray-50'
        } ${isToday ? 'ring-2 ring-emerald-500' : ''}`}
      >
        <span className={`text-sm ${hasEvent ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>
          {day}
        </span>
        {hasEvent && <div className="w-1 h-1 bg-emerald-600 rounded-full mx-auto mt-1" />}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Travel Calendar</h1>

        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {monthName} {year}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">{days}</div>
          </div>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Trips</h2>
          <div className="space-y-4">
            {trips
              .filter((trip) => new Date(trip.end_date) >= new Date())
              .slice(0, 5)
              .map((trip) => (
                <Card
                  key={trip.id}
                  hover
                  onClick={() => onNavigate('trip-detail', { tripId: trip.id })}
                >
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">{trip.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin size={14} className="mr-1" />
                        {trip.start_place}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{new Date(trip.start_date).toLocaleDateString()}</p>
                      <p>{new Date(trip.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedDate ? selectedDate.toLocaleDateString() : ''}
      >
        {selectedDate && (
          <div className="space-y-4">
            {getEventsForDate(selectedDate).map((trip) => (
              <Card
                key={trip.id}
                hover
                onClick={() => {
                  setShowModal(false);
                  onNavigate('trip-detail', { tripId: trip.id });
                }}
              >
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{trip.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {trip.start_place}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
