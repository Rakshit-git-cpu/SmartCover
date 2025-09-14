import React, { useState } from 'react';
import { Umbrella, Shield, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const Landing: React.FC = () => {
  const { isConfigured } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Show configuration message if Supabase is not set up
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-3xl w-fit mx-auto mb-6">
            <Umbrella className="h-12 w-12 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">SmartCover</h1>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
            <p className="text-yellow-300 font-medium mb-2">Setup Required</p>
            <p className="text-yellow-200 text-sm leading-relaxed">
              Please click the "Connect to Supabase" button in the top right corner to set up your database connection.
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            Once connected, you'll be able to register products and manage warranties.
          </p>
        </div>
      </div>
    );
  }
  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} onSwitchToRegister={() => {
      setShowLogin(false);
      setShowRegister(true);
    }} />;
  }

  if (showRegister) {
    return <RegisterForm onBack={() => setShowRegister(false)} onSwitchToLogin={() => {
      setShowRegister(false);
      setShowLogin(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-xl">
                <Umbrella className="h-6 w-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white">SmartCover</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2 text-white hover:text-yellow-400 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Warranties Secured,
              <span className="block bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Worries Covered
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Register your products, track warranties, and claim protection with ease. 
              Never lose warranty coverage again with our intelligent management platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => setShowRegister(true)}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold text-lg rounded-2xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 hover:shadow-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center space-x-3 px-8 py-4 border border-gray-700 text-white font-semibold text-lg rounded-2xl hover:border-yellow-400 hover:text-yellow-400 transition-all duration-200"
              >
                <span>Already have an account?</span>
              </button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything you need for warranty management
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive tools to protect your investments and streamline warranty claims
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-yellow-400/30 transition-all duration-300">
              <div className="bg-blue-500/20 p-4 rounded-2xl w-fit mb-6">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Product Registration</h3>
              <p className="text-gray-400 leading-relaxed">
                Register products instantly with invoice scanning or manual entry. 
                Our AI extracts details automatically from your purchase receipts.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-yellow-400/30 transition-all duration-300">
              <div className="bg-yellow-500/20 p-4 rounded-2xl w-fit mb-6">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Warranty Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Never miss warranty expiration again. Get timely alerts and 
                visual indicators for all your registered products.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-yellow-400/30 transition-all duration-300">
              <div className="bg-green-500/20 p-4 rounded-2xl w-fit mb-6">
                <Users className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Instant Claims</h3>
              <p className="text-gray-400 leading-relaxed">
                Submit warranty claims with one click. Automatic notifications 
                to dealers and repair centers with full claim details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">
                Why choose SmartCover?
              </h2>
              <div className="space-y-6">
                {[
                  'Premium design with intuitive user experience',
                  'AI-powered invoice scanning and data extraction',
                  'Real-time warranty status and expiration alerts',
                  'Seamless claim submission with automated notifications',
                  'Mobile-responsive design for on-the-go access',
                  'Secure cloud storage for all your warranty documents'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="bg-yellow-400/20 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-xl">
                      <Umbrella className="h-5 w-5 text-black" />
                    </div>
                    <span className="text-white font-semibold">Dashboard Preview</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium">iPhone 15 Pro</span>
                        <span className="text-green-400 text-xs">Valid</span>
                      </div>
                      <div className="text-gray-400 text-xs">Warranty expires in 287 days</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium">MacBook Pro</span>
                        <span className="text-yellow-400 text-xs">Expires Soon</span>
                      </div>
                      <div className="text-gray-400 text-xs">Warranty expires in 15 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to protect your investments?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of users who trust SmartCover to manage their warranties
          </p>
          <button
            onClick={() => setShowRegister(true)}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold text-lg rounded-2xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 hover:shadow-lg"
          >
            <span>Start Your Free Account</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-xl">
                <Umbrella className="h-5 w-5 text-black" />
              </div>
              <span className="text-gray-400">© 2025 SmartCover. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;