import React, { useState } from 'react';
import { X, RefreshCw, Calendar, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Product } from '../../types';

interface WarrantyRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onRenewalComplete: () => void;
}

const WarrantyRenewalModal: React.FC<WarrantyRenewalModalProps> = ({
  isOpen,
  onClose,
  product,
  onRenewalComplete,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'6' | '12' | '24' | '36'>('12');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const warrantyPlans = [
    { months: 6, price: 299, popular: false },
    { months: 12, price: 499, popular: true },
    { months: 24, price: 899, popular: false },
    { months: 36, price: 1299, popular: false },
  ];

  const selectedPlanData = warrantyPlans.find(plan => plan.months.toString() === selectedPlan);

  const handleRenewal = async () => {
    if (!user || !selectedPlanData) return;

    setLoading(true);

    try {
      // In demo mode, simulate success
      if (!isSupabaseConfigured) {
        setShowSuccess(true);
        setTimeout(() => {
          onRenewalComplete();
          onClose();
          setShowSuccess(false);
        }, 1200);
        return;
      }

      // Calculate new warranty expiry date
      const currentExpiry = new Date(product.warranty_expires_at);
      const newExpiry = new Date(currentExpiry);
      newExpiry.setMonth(newExpiry.getMonth() + selectedPlanData.months);

      // Update product warranty
      const { error: updateError } = await supabase
        .from('products')
        .update({
          warranty_period: product.warranty_period + selectedPlanData.months,
          warranty_expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      // Create renewal record
      const { error: renewalError } = await supabase
        .from('warranty_renewals')
        .insert({
          user_id: user.id,
          product_id: product.id,
          renewal_months: selectedPlanData.months,
          renewal_price: selectedPlanData.price,
          payment_method: paymentMethod,
          new_expiry_date: newExpiry.toISOString(),
          status: 'completed',
        });

      if (renewalError) {
        console.error('Error creating renewal record:', renewalError);
        // Don't throw error as the main update succeeded
      }

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Warranty Renewed Successfully',
          message: `${product.name} warranty has been extended by ${selectedPlanData.months} months. New expiry: ${newExpiry.toLocaleDateString()}`,
          type: 'success',
          read: false,
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      setShowSuccess(true);
      setTimeout(() => {
        onRenewalComplete();
        onClose();
        setShowSuccess(false);
      }, 2000);

    } catch (error: any) {
      console.error('Error renewing warranty:', error);
      alert('Failed to renew warranty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-8 text-center">
          <div className="bg-green-500/20 p-4 rounded-full w-fit mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Warranty Renewed!</h2>
          <p className="text-gray-400 mb-6">
            Your warranty has been successfully extended by {selectedPlanData?.months} months.
          </p>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">New Expiry Date</p>
            <p className="text-lg font-semibold text-white">
              {new Date(new Date(product.warranty_expires_at).getTime() + (selectedPlanData?.months || 0) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Renew Warranty</h2>
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
            <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{product.brand} • {product.model}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Current Expiry: {new Date(product.warranty_expires_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-yellow-400">
                <Shield className="h-4 w-4 mr-2" />
                <span>Expires in {Math.ceil((new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>
              </div>
            </div>
          </div>

          {/* Renewal Plans */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Choose Renewal Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              {warrantyPlans.map((plan) => (
                <button
                  key={plan.months}
                  onClick={() => setSelectedPlan(plan.months.toString() as any)}
                  className={`relative p-4 border rounded-xl transition-all duration-200 ${
                    selectedPlan === plan.months.toString()
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{plan.months}</div>
                    <div className="text-gray-400 text-sm">Months</div>
                    <div className="text-yellow-400 font-semibold mt-2">₹{plan.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-xl transition-all duration-200 ${
                  paymentMethod === 'card'
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <CreditCard className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-sm text-white">Card</div>
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 border rounded-xl transition-all duration-200 ${
                  paymentMethod === 'upi'
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="h-6 w-6 bg-blue-500 rounded mx-auto mb-2"></div>
                <div className="text-sm text-white">UPI</div>
              </button>
              <button
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-4 border rounded-xl transition-all duration-200 ${
                  paymentMethod === 'netbanking'
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="h-6 w-6 bg-green-500 rounded mx-auto mb-2"></div>
                <div className="text-sm text-white">Net Banking</div>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Renewal Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Product:</span>
                <span className="text-white">{product.name}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Current Expiry:</span>
                <span className="text-white">{new Date(product.warranty_expires_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Extension:</span>
                <span className="text-white">{selectedPlanData?.months} months</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>New Expiry:</span>
                <span className="text-white">
                  {new Date(new Date(product.warranty_expires_at).getTime() + (selectedPlanData?.months || 0) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total Amount:</span>
                  <span className="text-yellow-400">₹{selectedPlanData?.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRenewal}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Renew Warranty</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyRenewalModal;