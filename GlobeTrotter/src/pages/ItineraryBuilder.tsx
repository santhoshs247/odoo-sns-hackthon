import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';

interface ItineraryBuilderProps {
  onNavigate: (page: string, data?: any) => void;
  tripId: string;
}

interface Section {
  id?: string;
  title: string;
  start_date: string;
  end_date: string;
  budget: number;
  order_index: number;
}

interface Activity {
  id?: string;
  name: string;
  description: string;
  expense: number;
  category: string;
}

export function ItineraryBuilder({ onNavigate, tripId }: ItineraryBuilderProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section>({
    title: '',
    start_date: '',
    end_date: '',
    budget: 0,
    order_index: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSections();
  }, [tripId]);

  const fetchSections = async () => {
    const { data } = await supabase
      .from('itinerary_sections')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index');
    if (data) setSections(data);
  };

  const handleAddSection = () => {
    setCurrentSection({
      title: '',
      start_date: '',
      end_date: '',
      budget: 0,
      order_index: sections.length,
    });
    setShowModal(true);
  };

  const handleSaveSection = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('itinerary_sections').insert({
        trip_id: tripId,
        ...currentSection,
      });

      if (error) throw error;

      await fetchSections();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving section:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('itinerary_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      await fetchSections();
    } catch (err) {
      console.error('Error deleting section:', err);
    }
  };

  const handleFinish = () => {
    onNavigate('trip-detail', { tripId });
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

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Build Your Itinerary</h1>
          <p className="text-gray-600 mb-6">
            Add sections for each day or location in your trip
          </p>

          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(section.start_date).toLocaleDateString()} -{' '}
                        {new Date(section.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSection(section.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-emerald-700">
                      Budget: ${section.budget}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => onNavigate('add-activities', { sectionId: section.id })}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Activities
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={handleAddSection} variant="outline" fullWidth className="mt-6">
            <Plus size={20} className="mr-2" />
            Add Another Section
          </Button>

          {sections.length > 0 && (
            <Button onClick={handleFinish} fullWidth className="mt-4">
              Finish & View Itinerary
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Itinerary Section"
      >
        <div className="space-y-4">
          <Input
            type="text"
            label="Section Title"
            placeholder="Day 1 - Paris"
            value={currentSection.title}
            onChange={(e) =>
              setCurrentSection({ ...currentSection, title: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={currentSection.start_date}
              onChange={(e) =>
                setCurrentSection({ ...currentSection, start_date: e.target.value })
              }
            />
            <Input
              type="date"
              label="End Date"
              value={currentSection.end_date}
              onChange={(e) =>
                setCurrentSection({ ...currentSection, end_date: e.target.value })
              }
            />
          </div>

          <Input
            type="number"
            label="Budget"
            placeholder="500"
            value={currentSection.budget}
            onChange={(e) =>
              setCurrentSection({ ...currentSection, budget: Number(e.target.value) })
            }
          />

          <Button onClick={handleSaveSection} fullWidth disabled={loading}>
            {loading ? 'Saving...' : 'Save Section'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
