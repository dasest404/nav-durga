import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Eye,
  FileCheck,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { SalesOrder, Customer, Product, CompanySettings, OrderProductItem } from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface OrdersViewProps {
  orders: SalesOrder[];
  customers: Customer[];
  products: Product[];
  company: CompanySettings;
  onAddOrder: (order: SalesOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: SalesOrder['orderStatus']) => void;
  onUpdatePaymentStatus: (orderId: string, status: SalesOrder['paymentStatus']) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  customers,
  products,
  company,
  onAddOrder,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [deliveryLocation, setDeliveryLocation] = useState('Naya Raipur Sector 12');
  const [vehicleNumber, setVehicleNumber] = useState('CG-04-JB-9921');
  const [driverContact, setDriverContact] = useState('+91 94252 88123');
  const [paymentStatus, setPaymentStatus] = useState<SalesOrder['paymentStatus']>('Pending');

  // Simple item line
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [productName, setProductName] = useState(products[0]?.name || 'TMT Steel Rebar');
  const [grade, setGrade] = useState(products[0]?.grade || 'Fe 500D');
  const [quantity, setQuantity] = useState(25);
  const [unit, setUnit] = useState('MT');
  const [unitPrice, setUnitPrice] = useState(products[0]?.currentPrice || 58500);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.vehicleNumber && o.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesOrder = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    const matchesPayment = paymentStatusFilter === 'All' || o.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesOrder && matchesPayment;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const totalAmount = quantity * unitPrice;
    const selectedProd = products.find((p) => p.id === selectedProductId);
    const chosenProductId = selectedProductId || selectedProd?.id || products[0]?.id || '';
    const chosenProductName = selectedProd?.name || productName;

    const item: OrderProductItem = {
      productId: chosenProductId,
      productName: chosenProductName,
      grade: grade || selectedProd?.grade || selectedProd?.gaugeType || '',
      quantity,
      unit: selectedProd?.unit || unit,
      rate: unitPrice,
      amount: totalAmount,
      unitPrice,
      total: totalAmount,
    };

    const newOrder: SalesOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `NDI-ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: cust.id,
      customerName: cust.companyName,
      products: [item],
      items: [item],
      subtotal: totalAmount,
      tax: Math.round(totalAmount * 0.18),
      total: totalAmount,
      paymentStatus,
      orderStatus: 'Confirmed',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryLocation,
      vehicleNumber,
      driverContact,
    };

    onAddOrder(newOrder);
    setIsAddOpen(false);
  };

  const getOrderItems = (order: SalesOrder): OrderProductItem[] => {
    return order.items || order.products || [];
  };

  const handleShareDispatchOnWhatsApp = (order: SalesOrder) => {
    const cust = customers.find((c) => c.id === order.customerId);
    const mobile = cust?.whatsapp || cust?.mobile || '';

    const items = getOrderItems(order);

    let text = `*DISPATCH & ORDER CONFIRMATION — ${company.companyName.toUpperCase()}*\n\n`;
    text += `Order No: *${order.orderNumber}*\n`;
    text += `Customer: *${order.customerName}*\n`;
    text += `Delivery Location: ${order.deliveryLocation}\n`;
    text += `Status: *${order.orderStatus.toUpperCase()}*\n\n`;
    text += `*LOAD DETAILS:*\n`;
    items.forEach((it) => {
      text += `▫️ ${it.productName} (${it.grade}): *${it.quantity} ${it.unit}*\n`;
    });
    text += `Total Value: ₹${order.total.toLocaleString('en-IN')}\n`;
    text += `Payment: ${order.paymentStatus}\n\n`;
    if (order.vehicleNumber) {
      text += `🚚 *Trailer Number:* ${order.vehicleNumber}\n`;
    }
    if (order.driverContact) {
      text += `📞 *Driver Contact:* ${order.driverContact}\n`;
    }
    text += `\nDispatch Plant: ${company.address}, Urla, Raipur.\nSupport: ${company.phone}`;

    const url = WhatsAppService.buildWhatsAppWebUrl(mobile, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Orders & Dispatch Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {orders.length} Confirmed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor rolling mill bookings, transport trailers, payment receipts, and dispatch confirmations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (products.length > 0) {
              const currentOrFirst = products.find((p) => p.id === selectedProductId) || products[0];
              setSelectedProductId(currentOrFirst.id);
              setProductName(currentOrFirst.name);
              setGrade(currentOrFirst.grade || currentOrFirst.gaugeType || '');
              setUnitPrice(currentOrFirst.currentPrice);
              setUnit(currentOrFirst.unit || 'MT');
            }
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Sales Order</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order #, customer, vehicle (e.g. CG-04)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Dispatch Statuses</option>
              <option value="Confirmed">Confirmed (Queued)</option>
              <option value="Processing">Processing (Loading)</option>
              <option value="Dispatched">Dispatched (In-transit)</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3.5 px-4">Order # & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items & Quantity</th>
                <th className="py-3.5 px-4 text-right">Order Amount</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-center">Dispatch Status</th>
                <th className="py-3.5 px-4">Transport</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => {
                  const items = getOrderItems(ord);
                  const totalQty = items.reduce((s, it) => s + (it.quantity || 0), 0);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {ord.orderNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{ord.orderDate}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => onSelectCustomer(ord.customerId)}
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                        >
                          {ord.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500">{ord.deliveryLocation}</div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-800">
                          {items.map((i) => `${i.productName} (${i.grade})`).join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Total: <strong className="text-slate-900">{totalQty} MT</strong>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-blue-950 text-sm">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </td>

                      {/* Payment Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) =>
                            onUpdatePaymentStatus(ord.id, e.target.value as SalesOrder['paymentStatus'])
                          }
                          className={`text-xs px-2 py-1 rounded-lg font-bold border-0 cursor-pointer ${
                            ord.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>

                      {/* Delivery Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) =>
                            onUpdateOrderStatus(ord.id, e.target.value as SalesOrder['orderStatus'])
                          }
                          className={`text-xs px-2 py-1 rounded-lg font-bold border-0 cursor-pointer ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'Dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.orderStatus === 'Processing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>

                      {/* Transport info */}
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {ord.vehicleNumber ? (
                          <div className="font-semibold text-slate-800">{ord.vehicleNumber}</div>
                        ) : (
                          <span className="text-slate-400 italic">Not assigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleShareDispatchOnWhatsApp(ord)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="Share Dispatch Update on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 text-sm">
                    No sales orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl lg:max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Create Confirmed Sales Order</h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Consignee</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} (GSTIN: {c.gstin})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Specifications Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Steel Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      setSelectedProductId(pId);
                      const p = products.find((prod) => prod.id === pId);
                      if (p) {
                        setProductName(p.name);
                        setGrade(p.grade || p.gaugeType || '');
                        setUnitPrice(p.currentPrice);
                        if (p.unit) setUnit(p.unit);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.size} ({p.grade || p.gaugeType || p.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
                  <input
                    type="text"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (MT)</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹/MT)</label>
                  <input
                    type="number"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold text-blue-900 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as SalesOrder['paymentStatus'])}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trailer / Vehicle No</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. CG-04-JB-9921"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driver Contact</label>
                  <input
                    type="text"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    placeholder="+91 94252 XXXXX"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Destination / Site</label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Naya Raipur Sector 12 site godown"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                >
                  Confirm & Book Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
