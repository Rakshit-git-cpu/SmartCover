import React, { useState } from 'react';
import { ArrowLeft, Umbrella, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormProps {
  onBack: () => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onBack, onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (error) throw error;
      
      setSuccess(true);
    } catch (error: any) {
      if (error.message?.includes('Supabase is not properly configured')) {
        setError('Database connection not configured. Please connect to Supabase first.');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-3xl w-fit mx-auto mb-6">
              <Umbrella className="h-12 w-12 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Account Created!</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Welcome to Mera Chhata! Your account is ready to use. You can now start registering your products and managing warranties.
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <p className="text-green-400 text-sm">
                ✅ No email verification required - you can start using the app immediately!
              </p>
            </div>
            <button
              onClick={onSwitchToLogin}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
            >
              Continue to Sign In
            </button>
          </div>
        </div>
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-black items-center justify-center p-12">
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-3xl w-fit mx-auto mb-8">
              <Umbrella className="h-16 w-16 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">You're Protected</h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Your warranty management journey starts now. Track, protect, and claim with confidence.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to home</span>
          </button>

          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-2xl w-fit mx-auto mb-4">
              <Umbrella className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join Mera Chhata to protect your warranties</p>
            <p className="text-green-400 text-sm mt-2">✨ No email verification required - instant access!</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="John Doe"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="your@email.com"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Create a secure password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Confirm your password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-400">Already have an account? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-black items-center justify-center p-12">
        <div className="text-center">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-3xl w-fit mx-auto mb-8">
            <Umbrella className="h-16 w-16 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Premium Protection</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            Join thousands who trust Mera Chhata to manage their product warranties 
            and simplify their claim process.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">5000+</div>
              <div className="text-gray-400 text-sm">Products Protected</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">99%</div>
              <div className="text-gray-400 text-sm">Claim Success</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;