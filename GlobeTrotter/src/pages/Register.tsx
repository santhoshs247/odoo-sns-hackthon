import { useState } from 'react';
import { Map, Upload } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export function Register({ onNavigate }: RegisterProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
    profilePhotoUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        city: formData.city || null,
        country: formData.country || null,
        profile_photo_url: formData.profilePhotoUrl || null,
      });
      onNavigate('login');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-100 p-3 rounded-full mb-4">
              <Map className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600 mt-2">Join GlobeTrotter today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                {formData.profilePhotoUrl ? (
                  <img
                    src={formData.profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Upload className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <Input
                type="url"
                name="profilePhotoUrl"
                placeholder="Profile photo URL (optional)"
                value={formData.profilePhotoUrl}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />

              <Input
                type="text"
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            <Input
              type="tel"
              name="phone"
              label="Phone Number (Optional)"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                name="city"
                label="City (Optional)"
                placeholder="New York"
                value={formData.city}
                onChange={handleChange}
              />

              <Input
                type="text"
                name="country"
                label="Country (Optional)"
                placeholder="USA"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
