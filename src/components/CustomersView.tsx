import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Phone,
  MapPin,
  Building2,
  ChevronRight,
  ExternalLink,
  Edit2,
  Tag,
} from 'lucide-react';
import { Customer } from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomer,
  onAddCustomer,
  onEditCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Derive unique cities
  const cities = ['All', ...Array.from(new Set(customers.map((c) => c.city)))];
  const types = ['All', 'Test Customer', 'Wholesaler', 'Contractor', 'Builder', 'Fabricator', 'Infrastructure'];

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.tag && c.tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'All' || c.customerType === selectedType;
    const matchesCity = selectedCity === 'All' || c.city === selectedCity;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

    return matchesSearch && matchesType && matchesCity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Customers Directory
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered contractors, builders, and wholesalers receiving daily rate updates.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddCustomer}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, contact person, mobile, or GSTIN..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  City: {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Prospect">Prospect</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3.5 px-4">Customer & Firm</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">GSTIN</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    {/* Company & Person */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {customer.companyName}
                        </span>
                        {customer.tag && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            {customer.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Rep: {customer.name}
                      </div>
                    </td>

                    {/* Contact (Phone & WhatsApp) */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-semibold text-slate-800">
                        {customer.mobile}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-0.5">
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>{customer.whatsapp}</span>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer.city}, {customer.state}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {customer.customerType}
                      </span>
                    </td>

                    {/* GSTIN */}
                    <td className="py-3 px-4 font-mono text-xs text-blue-900 font-semibold">
                      {customer.gstin}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          customer.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={WhatsAppService.buildWhatsAppWebUrl(customer.whatsapp, '')}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => onEditCustomer(customer)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(customer)}
                          className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"
                          title="View Full Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-sm">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
