import React from 'react';
import { Calendar, Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onClaimWarranty: (product: Product) => void;
  onRenewWarranty: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClaimWarranty, onRenewWarranty }) => {
  const warrantyExpiresAt = new Date(product.warranty_expires_at);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((warrantyExpiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

  const getWarrantyStatus = () => {
    if (isExpired) return { text: 'Expired', icon: AlertTriangle, color: 'text-red-400' };
    if (isExpiringSoon) return { text: `Expires in ${daysUntilExpiry} days`, icon: AlertTriangle, color: 'text-yellow-400' };
    return { text: `Valid for ${daysUntilExpiry} days`, icon: CheckCircle, color: 'text-green-400' };
  };

  const warrantyStatus = getWarrantyStatus();
  const StatusIcon = warrantyStatus.icon;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
          <p className="text-gray-400 text-sm">{product.brand} • {product.model}</p>
        </div>
        <div className={`flex items-center space-x-1 ${warrantyStatus.color}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-xs font-medium">{warrantyStatus.text}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-400 text-sm">
          <span className="font-medium w-20">Serial:</span>
          <span className="text-gray-300">{product.serial_number}</span>
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Purchased: {new Date(product.purchase_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => onClaimWarranty(product)}
          disabled={isExpired}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            isExpired
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 hover:shadow-md'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>{isExpired ? 'Warranty Expired' : 'Claim Warranty'}</span>
        </button>
        
        {/* Renew Warranty Button - Show for expiring or expired products */}
        {(isExpiringSoon || isExpired) && (
          <button
            onClick={() => onRenewWarranty(product)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Renew</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;