import React, { useState, useEffect } from 'react';
import { X, Users, Save } from 'lucide-react';
import { Customer } from '../types';

interface CustomerFormModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => void;
  availableProducts: string[];
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSave,
  availableProducts,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Raipur');
  const [state, setState] = useState('Chhattisgarh');
  const [gstin, setGstin] = useState('');
  const [customerType, setCustomerType] = useState<Customer['customerType']>('Contractor');
  const [interestedProducts, setInterestedProducts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Customer['status']>('Active');
  const [creditDays, setCreditDays] = useState<number>(7);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setCompanyName(customer.companyName);
      setMobile(customer.mobile);
      setWhatsapp(customer.whatsapp);
      setEmail(customer.email);
      setAddress(customer.address);
      setCity(customer.city);
      setState(customer.state);
      setGstin(customer.gstin);
      setCustomerType(customer.customerType);
      setInterestedProducts(customer.interestedProducts || []);
      setNotes(customer.notes || '');
      setStatus(customer.status);
      setCreditDays(customer.creditDays || 7);
    } else {
      setName('');
      setCompanyName('');
      setMobile('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setCity('Raipur');
      setState('Chhattisgarh');
      setGstin('22AABC');
      setCustomerType('Contractor');
      setInterestedProducts(['TMT Fe 500D']);
      setNotes('');
      setStatus('Active');
      setCreditDays(7);
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const toggleProductInterest = (prod: string) => {
    if (interestedProducts.includes(prod)) {
      setInterestedProducts(interestedProducts.filter((p) => p !== prod));
    } else {
      setInterestedProducts([...interestedProducts, prod]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !mobile.trim()) {
      alert('Company Name and Mobile Number are required.');
      return;
    }

    onSave({
      name: name || companyName,
      companyName,
      mobile,
      whatsapp: whatsapp || mobile,
      email,
      address,
      city,
      state,
      gstin: gstin.toUpperCase(),
      customerType,
      interestedProducts,
      notes,
      status,
      creditDays,
      createdDate: customer ? customer.createdDate : new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl lg:max-w-5xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {customer ? 'Edit Customer Profile' : 'Add New Commercial Customer'}
              </h2>
              <p className="text-xs text-slate-500">
                Register buyer for daily WhatsApp price broadcasts & sales orders
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Row 1: Company, Contact Person, Mobile, WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company / Firm Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. ABC Construction"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anand Agrawal"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98271 XXXXX"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98271 XXXXX"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Row 2: Email, GSTIN, Type, Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="purchase@company.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GST Number (GSTIN)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="22AABCN1234F1Z8"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono text-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Type</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as Customer['customerType'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
              >
                <option value="Contractor">Contractor</option>
                <option value="Wholesaler">Wholesaler / Stockist</option>
                <option value="Builder">Builder / Developer</option>
                <option value="Fabricator">Fabricator</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Retailer">Retailer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
              <select
                value={creditDays}
                onChange={(e) => setCreditDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
              >
                <option value={0}>Advance Payment Only</option>
                <option value={7}>7 Days Credit</option>
                <option value={10}>10 Days Credit</option>
                <option value={14}>14 Days Credit</option>
                <option value={21}>21 Days Credit</option>
                <option value={30}>30 Days Credit</option>
              </select>
            </div>
          </div>

          {/* Row 3: Address, City, State, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Site / Godown Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot 12, Industrial Area Phase 2"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Customer['status'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Prospect">Prospect</option>
              </select>
            </div>
          </div>

          {/* Interested Products Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Interested Products (Used for targeted WhatsApp price broadcasts)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableProducts.map((prod) => {
                const isSelected = interestedProducts.includes(prod);
                return (
                  <button
                    key={prod}
                    type="button"
                    onClick={() => toggleProductInterest(prod)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? `✓ ${prod}` : `+ ${prod}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Key client for Naya Raipur projects. Delivery by 25 MT trailers."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
