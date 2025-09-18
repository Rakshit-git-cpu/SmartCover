import React, { useState } from 'react';
import { X, Upload, FileText, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { createWorker } from 'tesseract.js';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const { user, isConfigured } = useAuth();
  const [registrationMethod, setRegistrationMethod] = useState<'manual' | 'invoice' | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_period: 12,
    invoice_file: null as File | null,
  });

  const [invoiceProcessing, setInvoiceProcessing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [manualTextInput, setManualTextInput] = useState('');
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const extractProductDetails = (text: string) => {
    console.log('Extracting product details from text:', text.substring(0, 500) + '...');
    
    // Split text into lines for better analysis
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('Text lines:', lines);
    
    // Known brand names for better matching
    const knownBrands = [
      'Apple', 'Samsung', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Sony', 'LG', 
      'Canon', 'Nikon', 'Microsoft', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Motorola',
      'Nokia', 'BlackBerry', 'HTC', 'Oppo', 'Vivo', 'Realme', 'Nothing', 'Fairphone'
    ];
    
    // Common product categories
    const productCategories = [
      'iPhone', 'iPad', 'MacBook', 'Mac', 'iMac', 'Mac Pro', 'Mac Mini', 'AirPods',
      'Galaxy', 'Note', 'Tab', 'Watch', 'Buds', 'Earbuds', 'Laptop', 'Desktop',
      'Computer', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones',
      'Speaker', 'Camera', 'Printer', 'Scanner', 'Router', 'Modem', 'Charger',
      'Cable', 'Case', 'Cover', 'Screen Protector', 'Stand', 'Dock'
    ];
    
    const extractedData = {
      name: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      warranty_period: 12,
    };

    // Smart extraction algorithm
    console.log('Starting smart extraction...');
    
    // 1. Extract Brand first (most reliable)
    for (const line of lines) {
      for (const brand of knownBrands) {
        if (line.toLowerCase().includes(brand.toLowerCase())) {
          extractedData.brand = brand;
          console.log('Found brand:', brand, 'in line:', line);
          break;
        }
      }
      if (extractedData.brand) break;
    }
    
    // 2. Extract Product Name (look for product descriptions)
    let bestProductLine = '';
    let bestProductScore = 0;
    
    for (const line of lines) {
      let score = 0;
      
      // Skip lines that are clearly not product names
      if (line.match(/^\d+$/) || // Just numbers
          line.match(/^\d+[\/\-\.]\d+[\/\-\.]\d+$/) || // Dates
          line.match(/^[A-Z0-9\-]{8,}$/) || // Serial numbers
          line.match(/^(total|subtotal|tax|shipping|discount|amount|price|qty|quantity)/i) || // Invoice terms
          line.length < 5 || // Too short
          line.length > 100) { // Too long
        continue;
      }
      
      // Score based on product category keywords
      for (const category of productCategories) {
        if (line.toLowerCase().includes(category.toLowerCase())) {
          score += 10;
        }
      }
      
      // Score based on length (product names are usually 10-60 characters)
      if (line.length >= 10 && line.length <= 60) {
        score += 5;
      }
      
      // Score based on containing brand name
      if (extractedData.brand && line.toLowerCase().includes(extractedData.brand.toLowerCase())) {
        score += 15;
      }
      
      // Score based on containing model-like patterns
      if (line.match(/[A-Z0-9\-]{3,}/)) {
        score += 3;
      }
      
      if (score > bestProductScore) {
        bestProductLine = line;
        bestProductScore = score;
      }
    }
    
    if (bestProductLine) {
      extractedData.name = bestProductLine;
      console.log('Found product name:', bestProductLine, 'with score:', bestProductScore);
    }
    
    // 3. Extract Model (look for alphanumeric codes)
    for (const line of lines) {
      // Look for model patterns
      const modelMatch = line.match(/(?:model|part|sku|item)[\s:]*([A-Z0-9\-]{3,20})/i);
      if (modelMatch) {
        extractedData.model = modelMatch[1];
        console.log('Found model:', extractedData.model, 'in line:', line);
        break;
      }
      
      // Look for generic alphanumeric codes that might be models
      const genericModel = line.match(/^([A-Z0-9\-]{5,20})$/);
      if (genericModel && !line.match(/^\d+$/) && !line.match(/^\d+[\/\-\.]\d+[\/\-\.]\d+$/)) {
        extractedData.model = genericModel[1];
        console.log('Found generic model:', extractedData.model, 'in line:', line);
        break;
      }
    }
    
    // 4. Extract Serial Number
    for (const line of lines) {
      const serialMatch = line.match(/(?:serial|s\/n|sn|imei)[\s:]*([A-Z0-9\-]{8,})/i);
      if (serialMatch) {
        extractedData.serial_number = serialMatch[1];
        console.log('Found serial number:', extractedData.serial_number, 'in line:', line);
        break;
      }
      
      // Look for long alphanumeric codes that might be serial numbers
      const longCode = line.match(/^([A-Z0-9]{10,})$/);
      if (longCode) {
        extractedData.serial_number = longCode[1];
        console.log('Found long code as serial:', extractedData.serial_number, 'in line:', line);
        break;
      }
    }
    
    // 5. Extract Purchase Date
    for (const line of lines) {
      const dateMatch = line.match(/(?:date|purchase|invoice|order|billing)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
      if (dateMatch) {
        try {
          const date = new Date(dateMatch[1]);
          if (!isNaN(date.getTime())) {
            extractedData.purchase_date = date.toISOString().split('T')[0];
            console.log('Found purchase date:', extractedData.purchase_date, 'in line:', line);
            break;
          }
        } catch (e) {
          console.warn('Could not parse date:', dateMatch[1]);
        }
      }
      
      // Look for generic date patterns
      const genericDate = line.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
      if (genericDate) {
        try {
          const date = new Date(genericDate[1]);
          if (!isNaN(date.getTime()) && date.getFullYear() > 2020) { // Reasonable year
            extractedData.purchase_date = date.toISOString().split('T')[0];
            console.log('Found generic date:', extractedData.purchase_date, 'in line:', line);
            break;
          }
        } catch (e) {
          console.warn('Could not parse generic date:', genericDate[1]);
        }
      }
    }
    
    // 6. Extract Warranty Period
    for (const line of lines) {
      const warrantyMatch = line.match(/(?:warranty|guarantee)[\s:]*(\d+)\s*(?:months?|years?|days?)/i);
      if (warrantyMatch) {
        const period = parseInt(warrantyMatch[1]);
        const unit = warrantyMatch[0].toLowerCase();
        if (unit.includes('year')) {
          extractedData.warranty_period = period * 12;
        } else if (unit.includes('month')) {
          extractedData.warranty_period = period;
        } else if (unit.includes('day')) {
          extractedData.warranty_period = Math.ceil(period / 30);
        }
        console.log('Found warranty period:', extractedData.warranty_period, 'in line:', line);
        break;
      }
    }
    
    // 7. Smart fallbacks
    // If we have a product name but no brand, try to extract brand from name
    if (extractedData.name && !extractedData.brand) {
      for (const brand of knownBrands) {
        if (extractedData.name.toLowerCase().includes(brand.toLowerCase())) {
          extractedData.brand = brand;
          console.log('Extracted brand from product name:', extractedData.brand);
          break;
        }
      }
    }
    
    // If we have a brand but no product name, try to find a product description
    if (extractedData.brand && !extractedData.name) {
      for (const line of lines) {
        if (line.length > 10 && line.length < 100 && 
            !line.match(/^\d+$/) && 
            !line.match(/^\d+[\/\-\.]\d+[\/\-\.]\d+$/) &&
            line.toLowerCase().includes(extractedData.brand.toLowerCase())) {
          extractedData.name = line;
          console.log('Found product name with brand match:', extractedData.name);
          break;
        }
      }
    }

    // Final logging
    console.log('Final extraction results:', extractedData);
    
    return extractedData;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, invoice_file: file }));

    if (registrationMethod === 'invoice') {
      setInvoiceProcessing(true);
      
      try {
        console.log('Starting OCR processing for file:', file.name, 'Type:', file.type);
        
        // Create Tesseract worker
        const worker = await createWorker('eng');
        console.log('Tesseract worker created successfully');
        
        // Perform OCR on the uploaded file
        console.log('Starting OCR recognition...');
        const { data: { text } } = await worker.recognize(file);
        console.log('OCR completed. Extracted text length:', text.length);
        console.log('First 500 characters of extracted text:', text.substring(0, 500));
        
        // Store extracted text for debugging
        setExtractedText(text);
        
        // Extract product details from the OCR text
        const extractedData = extractProductDetails(text);
        console.log('Extracted data:', extractedData);
        
        // Update form data with extracted information
        const updatedFormData = {
          name: extractedData.name || '',
          brand: extractedData.brand || '',
          model: extractedData.model || '',
          serial_number: extractedData.serial_number || '',
          purchase_date: extractedData.purchase_date || '',
          warranty_period: extractedData.warranty_period || 12,
          invoice_file: formData.invoice_file,
        };
        
        setFormData(updatedFormData);
        console.log('Updated form data:', updatedFormData);
        
        // Track which fields were auto-filled
        const filledFields = Object.entries(extractedData)
          .filter(([key, value]) => value && value !== '')
          .map(([key]) => key);
        setAutoFilledFields(filledFields);

        // Terminate the worker
        await worker.terminate();
        console.log('Worker terminated');
        
        // Show success message with more details
        const extractedFields = Object.entries(extractedData).filter(([key, value]) => value && value !== '');
        if (extractedFields.length > 0) {
          alert(`Invoice processed successfully! Extracted ${extractedFields.length} fields. The form has been automatically filled - please review and edit if needed.`);
        } else {
          alert('Invoice processed but no product details were automatically extracted. Please fill in the details manually.');
        }
        
      } catch (error) {
        console.error('Error processing invoice:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        alert(`Failed to process invoice: ${error.message}. Please try again or use manual entry.`);
      } finally {
        setInvoiceProcessing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to add products.');
      return;
    }

    // Validate required fields
    if (!formData.name.trim() || !formData.brand.trim() || !formData.model.trim() || !formData.serial_number.trim() || !formData.purchase_date) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // If Supabase isn't configured (demo mode), short-circuit gracefully
      if (!isConfigured) {
        onProductAdded();
        resetForm();
        alert('Demo mode: product not saved to database, but flow completed.');
        return;
      }

      if (debugMode) {
        console.log('Form data:', formData);
        console.log('User:', user);
      }

      // Ensure user profile exists in users table using upsert to avoid race conditions
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'User',
        }, { onConflict: 'id' });
      if (upsertError) {
        console.warn('User profile upsert failed, proceeding anyway:', upsertError);
        // Non-blocking: continue with product creation. Products table references auth.users
      }

      // Calculate warranty expiry date
      const purchaseDate = new Date(formData.purchase_date);
      if (isNaN(purchaseDate.getTime())) {
        throw new Error('Invalid purchase date.');
      }
      
      const warrantyExpiresAt = new Date(purchaseDate);
      warrantyExpiresAt.setMonth(warrantyExpiresAt.getMonth() + formData.warranty_period);

      if (debugMode) {
        console.log('Purchase date:', purchaseDate);
        console.log('Warranty expires at:', warrantyExpiresAt);
      }

      let invoiceUrl = null;

      // Upload invoice if provided
      if (formData.invoice_file) {
        const fileExt = formData.invoice_file.name.split('.').pop();
        const fileName = `${user.id}/invoice_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(fileName, formData.invoice_file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload invoice: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('invoices')
          .getPublicUrl(fileName);

        invoiceUrl = publicUrl;
      }

      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: formData.name,
          brand: formData.brand,
          model: formData.model,
          serial_number: formData.serial_number,
          purchase_date: formData.purchase_date,
          warranty_period: formData.warranty_period,
          warranty_expires_at: warrantyExpiresAt.toISOString(),
          invoice_url: invoiceUrl,
        })
        .select();

      if (error) throw error;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Product Registered',
          message: `${formData.name} has been successfully registered with warranty protection.`,
          type: 'success',
          read: false,
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't throw error for notification failure
      }

      onProductAdded();
      resetForm();
      alert('Product added successfully!');
    } catch (error: any) {
      console.error('Error adding product:', error);
      let errorMessage = 'Failed to add product. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'A product with this serial number already exists.';
        } else if (error.message.includes('storage')) {
          errorMessage = 'Failed to upload invoice. Please try again without the file.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please make sure you are logged in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRegistrationMethod(null);
    setFormData({
      name: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      warranty_period: 12,
      invoice_file: null,
    });
    setExtractedText('');
    setManualTextInput('');
    setAutoFilledFields([]);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Add New Product</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              Debug: {debugMode ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!registrationMethod ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">How would you like to register your product?</h3>
              
              <button
                onClick={() => setRegistrationMethod('invoice')}
                className="w-full p-6 border border-gray-700 rounded-xl hover:border-yellow-400 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-500/20 p-3 rounded-xl group-hover:bg-yellow-500/30">
                    <FileText className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">Upload Invoice</h4>
                    <p className="text-gray-400 text-sm">Auto-fill product details from your online purchase invoice</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRegistrationMethod('manual')}
                className="w-full p-6 border border-gray-700 rounded-xl hover:border-yellow-400 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl group-hover:bg-blue-500/30">
                    <Package className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">Manual Entry</h4>
                    <p className="text-gray-400 text-sm">Enter product details manually for offline purchases</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {registrationMethod === 'invoice' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Upload Invoice</label>
                  <div className="border border-gray-700 border-dashed rounded-xl p-6 text-center hover:border-yellow-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="invoice-upload"
                    />
                    <label htmlFor="invoice-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Click to upload invoice (PDF, JPG, PNG)</p>
                      {formData.invoice_file && (
                        <p className="text-yellow-400 mt-2">{formData.invoice_file.name}</p>
                      )}
                    </label>
                  </div>
                  {invoiceProcessing && (
                    <div className="flex items-center space-x-2 text-yellow-400 mt-2">
                      <div className="animate-spin h-4 w-4 border-b-2 border-yellow-400 rounded-full"></div>
                      <span className="text-sm">Processing invoice...</span>
                    </div>
                  )}
                  
                  {debugMode && extractedText && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-2">Extracted Text (Debug):</h4>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {extractedText}
                      </pre>
                      <div className="mt-2 text-xs text-gray-400">
                        Text length: {extractedText.length} characters
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Lines: {extractedText.split('\n').length}
                      </div>
                    </div>
                  )}
                  
                  {debugMode && autoFilledFields.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-2">Auto-filled Fields:</h4>
                      <div className="text-xs text-gray-300">
                        {autoFilledFields.map(field => (
                          <div key={field} className="mb-1">
                            <span className="text-yellow-400">{field}:</span> {formData[field as keyof typeof formData]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {debugMode && !extractedText && !invoiceProcessing && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-2">Debug Info:</h4>
                      <p className="text-xs text-gray-300">No text extracted yet. Upload an invoice to see OCR results.</p>
                    </div>
                  )}
                  
                  {/* Manual text input as fallback */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Manual Text Input (if OCR fails):
                    </label>
                    <textarea
                      value={manualTextInput}
                      onChange={(e) => setManualTextInput(e.target.value)}
                      placeholder="Paste invoice text here if OCR doesn't work..."
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                      rows={4}
                    />
                    {manualTextInput && (
                      <button
                        type="button"
                        onClick={() => {
                          const extractedData = extractProductDetails(manualTextInput);
                          const updatedFormData = {
                            name: extractedData.name || '',
                            brand: extractedData.brand || '',
                            model: extractedData.model || '',
                            serial_number: extractedData.serial_number || '',
                            purchase_date: extractedData.purchase_date || '',
                            warranty_period: extractedData.warranty_period || 12,
                            invoice_file: formData.invoice_file,
                          };
                          setFormData(updatedFormData);
                          setExtractedText(manualTextInput);
                          console.log('Manual extraction - Updated form data:', updatedFormData);
                          
                          // Track which fields were auto-filled
                          const filledFields = Object.entries(extractedData)
                            .filter(([key, value]) => value && value !== '')
                            .map(([key]) => key);
                          setAutoFilledFields(filledFields);
                        }}
                        className="mt-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                      >
                        Extract from Manual Text
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Product Name *
                    {autoFilledFields.includes('name') && (
                      <span className="ml-2 text-xs text-yellow-400">✓ Auto-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="iPhone 15 Pro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Brand *
                    {autoFilledFields.includes('brand') && (
                      <span className="ml-2 text-xs text-yellow-400">✓ Auto-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="Apple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Model *
                    {autoFilledFields.includes('model') && (
                      <span className="ml-2 text-xs text-yellow-400">✓ Auto-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="iPhone 15 Pro 128GB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Serial Number *
                    {autoFilledFields.includes('serial_number') && (
                      <span className="ml-2 text-xs text-yellow-400">✓ Auto-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="ABC123DEF456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Purchase Date *
                    {autoFilledFields.includes('purchase_date') && (
                      <span className="ml-2 text-xs text-yellow-400">✓ Auto-filled</span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Warranty Period (Months) *
                    {autoFilledFields.includes('warranty_period') && (
                      <span className="ml-2 text-xs text-yellow-400">✓ Auto-filled</span>
                    )}
                  </label>
                  <select
                    name="warranty_period"
                    value={formData.warranty_period}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={36}>3 Years</option>
                  </select>
                </div>
              </div>

              {registrationMethod === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Invoice (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:text-black file:font-medium"
                  />
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || invoiceProcessing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding Product...' : 'Add Product'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;