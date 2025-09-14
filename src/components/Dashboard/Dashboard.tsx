import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Product, WarrantyClaim, Notification } from '../../types';
import ProductCard from './ProductCard';
import AddProductModal from './AddProductModal';
import WarrantyClaimModal from './WarrantyClaimModal';
import WarrantyRenewalModal from './WarrantyRenewalModal';
import NotificationPanel from './NotificationPanel';

interface DashboardProps {
  onNotificationClick: () => void;
  notificationCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNotificationClick, notificationCount }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isWarrantyClaimOpen, setIsWarrantyClaimOpen] = useState(false);
  const [isWarrantyRenewalOpen, setIsWarrantyRenewalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchNotifications();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Show user-friendly error message
      alert('Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClaimWarranty = (product: Product) => {
    setSelectedProduct(product);
    setIsWarrantyClaimOpen(true);
  };

  const handleRenewWarranty = (product: Product) => {
    setSelectedProduct(product);
    setIsWarrantyRenewalOpen(true);
  };

  const handleProductAdded = () => {
    fetchProducts();
    setIsAddProductOpen(false);
  };

  const handleClaimSubmitted = () => {
    fetchNotifications();
    setIsWarrantyClaimOpen(false);
    setSelectedProduct(null);
  };

  const handleRenewalComplete = () => {
    fetchProducts();
    fetchNotifications();
    setIsWarrantyRenewalOpen(false);
    setSelectedProduct(null);
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(true);
  };

  // Debug function for testing - expose to window for console access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugWarrantySystem = {
        getProducts: () => products,
        getNotifications: () => notifications,
        getUser: () => user,
        getExpiringProducts: () => {
          return products.filter(p => {
            const daysUntilExpiry = Math.ceil((new Date(p.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
          });
        },
        testExpiryCheck: () => {
          const expiring = products.filter(p => {
            const daysUntilExpiry = Math.ceil((new Date(p.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
          });
          console.log('Expiring products:', expiring);
          return expiring;
        }
      };
    }
  }, [products, notifications, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'there'}!
            </h1>
              <p className="text-gray-400">Warranties Secured, Worries Covered</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Package className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Warranties</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => new Date(p.warranty_expires_at) > new Date()).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Expiring Soon</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => {
                    const daysUntilExpiry = Math.ceil((new Date(p.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Warning Banner */}
        {products.filter(p => {
          const daysUntilExpiry = Math.ceil((new Date(p.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        }).length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-300 mb-1">Warranty Expiry Alert</h3>
                <p className="text-yellow-200">
                  You have {products.filter(p => {
                    const daysUntilExpiry = Math.ceil((new Date(p.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                  }).length} product(s) with warranties expiring in the next 30 days.
                </p>
                <p className="text-yellow-200/80 text-sm mt-2">
                  Check your products below and submit any warranty claims before they expire.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Your Products</h2>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClaimWarranty={handleClaimWarranty}
                onRenewWarranty={handleRenewWarranty}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Products Yet</h3>
              <p className="text-gray-400 mb-6">Start by adding your first product to track its warranty</p>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Product</span>
              </button>
            </div>
          </div>
        )}
      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {selectedProduct && (
        <WarrantyClaimModal
          isOpen={isWarrantyClaimOpen}
          onClose={() => {
            setIsWarrantyClaimOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onClaimSubmitted={handleClaimSubmitted}
        />
      )}

      {selectedProduct && (
        <WarrantyRenewalModal
          isOpen={isWarrantyRenewalOpen}
          onClose={() => {
            setIsWarrantyRenewalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onRenewalComplete={handleRenewalComplete}
        />
      )}

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onNotificationsRead={fetchNotifications}
      />
    </div>
  );
};

export default Dashboard;