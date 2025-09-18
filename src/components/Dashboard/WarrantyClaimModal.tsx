import React, { useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Product } from '../../types';

interface WarrantyClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onClaimSubmitted: () => void;
}

const WarrantyClaimModal: React.FC<WarrantyClaimModalProps> = ({
  isOpen,
  onClose,
  product,
  onClaimSubmitted,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    problem_description: '',
    contact_phone: '',
    preferred_contact_method: 'email',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // In demo mode, skip network operations
      if (!isSupabaseConfigured) {
        onClaimSubmitted();
        setFormData({ problem_description: '', contact_phone: '', preferred_contact_method: 'email' });
        return;
      }

      // Create warranty claim
      const { error: claimError } = await supabase
        .from('warranty_claims')
        .insert({
          user_id: user.id,
          product_id: product.id,
          problem_description: formData.problem_description,
          status: 'pending',
        });

      if (claimError) throw claimError;

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Warranty Claim Submitted',
          message: `Your warranty claim for ${product.name} has been submitted successfully. We'll contact you soon.`,
          type: 'success',
          read: false,
        });

      // Send notification to admin/dealer (this would typically be done via an edge function)
      const claimDetails = {
        product: product,
        user: user,
        problem: formData.problem_description,
        contact_phone: formData.contact_phone,
        preferred_contact: formData.preferred_contact_method,
      };

      // Call edge function to send notifications
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/warranty-claim-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimDetails),
      });

      onClaimSubmitted();
      setFormData({
        problem_description: '',
        contact_phone: '',
        preferred_contact_method: 'email',
      });
    } catch (error) {
      console.error('Error submitting warranty claim:', error);
      alert('Failed to submit warranty claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500/20 p-2 rounded-xl">
              <Shield className="h-6 w-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Warranty Claim</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Product Info */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-white font-medium mb-2">{product.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Brand: </span>
                <span className="text-white">{product.brand}</span>
              </div>
              <div>
                <span className="text-gray-400">Model: </span>
                <span className="text-white">{product.model}</span>
              </div>
              <div>
                <span className="text-gray-400">Serial: </span>
                <span className="text-white">{product.serial_number}</span>
              </div>
              <div>
                <span className="text-gray-400">Purchase Date: </span>
                <span className="text-white">{new Date(product.purchase_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Describe the problem/damage *
              </label>
              <textarea
                value={formData.problem_description}
                onChange={(e) => setFormData(prev => ({ ...prev, problem_description: e.target.value }))}
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                placeholder="Please describe the issue with your product in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Preferred Contact Method *
                </label>
                <select
                  value={formData.preferred_contact_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_contact_method: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium mb-1">What happens next?</p>
                <p className="text-blue-200">
                  We'll review your claim and contact the authorized dealer/repair center. 
                  You'll receive updates via your preferred contact method and in-app notifications.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting Claim...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WarrantyClaimModal;