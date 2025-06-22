import React from 'react';
import sampleData from './sample-data.json';

interface InvoiceModernProps {
  schema: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: {
    name: string;
    address: string;
    city: string;
    email: string;
    phone: string;
  };
  client: {
    name: string;
    address: string;
    city: string;
    email: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<InvoiceModernProps>) => void;
  }
}

const InvoiceModern: React.FC<InvoiceModernProps> = ({ data }) => {
  // Use user data if provided, otherwise use default data
  const invoiceData = data && typeof data === 'object' ? (data as unknown as InvoiceData) : sampleData;

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-lg p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-black">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">INVOICE</h1>
            <p className="mt-2 text-blue-100">Professional Services</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{invoiceData.invoiceNumber}</div>
            <div className="mt-1 text-blue-100">Invoice Date: {invoiceData.date}</div>
            <div className="text-blue-100">Due Date: {invoiceData.dueDate}</div>
          </div>
        </div>
      </div>

      {/* Company and Client Info */}
      <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">From:</h3>
          <div className="text-gray-700">
            <div className="font-semibold">{invoiceData.company.name}</div>
            <div>{invoiceData.company.address}</div>
            <div>{invoiceData.company.city}</div>
            <div className="mt-2">
              <div>Email: {invoiceData.company.email}</div>
              <div>Phone: {invoiceData.company.phone}</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">To:</h3>
          <div className="text-gray-700">
            <div className="font-semibold">{invoiceData.client.name}</div>
            <div>{invoiceData.client.address}</div>
            <div>{invoiceData.client.city}</div>
            <div className="mt-2">
              <div>Email: {invoiceData.client.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-8">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Rate
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div className="font-medium">{item.description}</div>
                  <div className="text-gray-500">{item.unit}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                  ${item.rate.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                  ${item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 px-8 py-6">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${invoiceData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax (10%):</span>
              <span className="font-medium">${invoiceData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 py-3">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">${invoiceData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-8 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p className="mt-1">Payment is due within 30 days of invoice date.</p>
        </div>
      </div>
    </div>
  );
};

// Export for dynamic loading
export default InvoiceModern;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('invoice-modern', InvoiceModern);
} 