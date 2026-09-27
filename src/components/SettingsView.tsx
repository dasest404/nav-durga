import React, { useState } from 'react';
import {
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { CompanySettings, WhatsAppConfig } from '../types';

interface SettingsViewProps {
  company: CompanySettings;
  whatsAppConfig: WhatsAppConfig;
  onSaveCompany: (updated: CompanySettings) => void;
  onSaveWhatsAppConfig: (updated: WhatsAppConfig) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  whatsAppConfig,
  onSaveCompany,
  onSaveWhatsAppConfig,
  onResetDemoData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'company' | 'terms' | 'api'>('company');

  // Company state
  const [compName, setCompName] = useState(company.companyName);
  const [tagline, setTagline] = useState(company.tagline);
  const [address, setAddress] = useState(company.address);
  const [city, setCity] = useState(company.city);
  const [state, setState] = useState(company.state);
  const [phone, setPhone] = useState(company.phone);
  const [whatsapp, setWhatsapp] = useState(company.whatsapp);
  const [email, setEmail] = useState(company.email);
  const [gstin, setGstin] = useState(company.gstin);

  // Bank
  const [bankName, setBankName] = useState(company.bankDetails?.bankName || company.bankName || 'State Bank of India');
  const [accountNumber, setAccountNumber] = useState(company.bankDetails?.accountNumber || company.accountNumber || '38920192834');
  const [ifsc, setIfsc] = useState(company.bankDetails?.ifsc || company.ifsc || 'SBIN0004128');
  const [branch, setBranch] = useState(company.bankDetails?.branch || 'Urla Industrial Area, Raipur');

  // Terms
  const [paymentTerms, setPaymentTerms] = useState(
    company.standardTerms?.paymentTerms || '100% advance RTGS/NEFT against proforma invoice before trailer loading.'
  );
  const [deliveryTerms, setDeliveryTerms] = useState(
    company.standardTerms?.deliveryTerms || 'Ex-Works Urla Industrial Area, Raipur, CG. Freight extra at actuals.'
  );
  const [validityTerms, setValidityTerms] = useState(
    company.standardTerms?.validityTerms || 'Rates valid for 24 hours only due to volatile raw billet market prices.'
  );
  const [weighbridgeTerms, setWeighbridgeTerms] = useState(
    company.standardTerms?.weighbridgeTerms || 'Weight recorded at Nav Durga certified computerized weighbridge will be final and binding.'
  );

  // API Config
  const [apiMode, setApiMode] = useState<WhatsAppConfig['mode']>(whatsAppConfig.mode || 'manual');
  const [phoneNumberId, setPhoneNumberId] = useState(whatsAppConfig.phoneNumberId || '');
  const [wabaId, setWabaId] = useState(whatsAppConfig.businessAccountId || whatsAppConfig.wabaId || '');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState(whatsAppConfig.webhookVerifyToken || '');
  const [permanentToken, setPermanentToken] = useState(whatsAppConfig.apiToken || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany({
      ...company,
      companyName: compName,
      tagline,
      address,
      city,
      state,
      phone,
      whatsapp,
      email,
      gstin,
      bankName,
      accountNumber,
      ifsc,
      bankDetails: {
        bankName,
        accountNumber,
        ifsc,
        branch,
      },
      standardTerms: {
        paymentTerms,
        deliveryTerms,
        validityTerms,
        weighbridgeTerms,
      },
      poweredBy: company.poweredBy || 'Klyia Technology',
    });

    onSaveWhatsAppConfig({
      ...whatsAppConfig,
      mode: apiMode,
      phoneNumberId,
      businessAccountId: wabaId,
      wabaId,
      webhookVerifyToken,
      apiToken: permanentToken,
      apiUrl: 'https://graph.facebook.com/v19.0',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ERP Settings & Enterprise Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure Nav Durga company profile, quotation bank details, and Meta WhatsApp API parameters.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('company')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'company'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Company Profile & Bank Info
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('terms')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'terms'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Standard Terms & Weighbridge Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('api')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'api'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-indigo-600" />
          <span>WhatsApp API Integration Setup</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* SUBTAB 1: COMPANY */}
        {activeSubTab === 'company' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Business Details (Displayed on Posts, Invoices & Quotations)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono text-emerald-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono font-bold text-blue-900 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plant Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Bank Account Details (Printed on Commercial Quotations & Invoices)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: TERMS */}
        {activeSubTab === 'terms' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Default Commercial Terms
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard Delivery Terms</label>
                <input
                  type="text"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Validity Period</label>
                <input
                  type="text"
                  value={validityTerms}
                  onChange={(e) => setValidityTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weighbridge & Quality Clause</label>
                <textarea
                  rows={2}
                  value={weighbridgeTerms}
                  onChange={(e) => setWeighbridgeTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: WHATSAPP API */}
        {activeSubTab === 'api' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Meta WhatsApp Business Cloud API Configuration
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Modular abstraction for seamless future connection to official WhatsApp Cloud API without altering the UI.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Operational Mode</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  {apiMode === 'manual' ? 'Manual / Click-to-Chat Mode' : 'Cloud API Connected'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                In Manual Mode, all broadcasts and customer replies use native <code>wa.me</code> click-to-chat links, avoiding WhatsApp template fees and setup delays.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number ID (From Meta Developer Portal)
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="e.g. 109283746192834"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  placeholder="e.g. 9817263541829"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Webhook Verify Token (Secret for Inbound Callbacks)
                </label>
                <input
                  type="text"
                  value={webhookVerifyToken}
                  onChange={(e) => setWebhookVerifyToken(e.target.value)}
                  placeholder="nav_durga_erp_webhook_secret_2026"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  System User Permanent Access Token
                </label>
                <input
                  type="password"
                  value={permanentToken}
                  onChange={(e) => setPermanentToken(e.target.value)}
                  placeholder="EAAG... (Stored securely)"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
              <span className="font-bold">Architecture Note:</span> All service calls flow through{' '}
              <code>WhatsAppService</code>. When Meta credentials are populated, messages will automatically switch from client-side links to server-side webhook dispatch without requiring any changes to products, customers, or sales orders.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all demo data back to clean factory defaults?')) {
                onResetDemoData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Defaults</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
