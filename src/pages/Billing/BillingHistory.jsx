import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Download, Loader, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const BillingHistory = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, you would fetch this from your backend
        // For now, we'll simulate invoices with mock data
        const mockInvoices = [
          {
            id: 'inv_123456',
            amount: 4900, // in cents
            status: 'paid',
            created: new Date('2023-12-01').getTime(),
            periodStart: new Date('2023-12-01').getTime(),
            periodEnd: new Date('2024-01-01').getTime(),
            pdf: '#',
            plan: 'Pro'
          },
          {
            id: 'inv_123457',
            amount: 4900, // in cents
            status: 'paid',
            created: new Date('2024-01-01').getTime(),
            periodStart: new Date('2024-01-01').getTime(),
            periodEnd: new Date('2024-02-01').getTime(),
            pdf: '#',
            plan: 'Pro'
          },
          {
            id: 'inv_123458',
            amount: 4900, // in cents
            status: 'paid',
            created: new Date('2024-02-01').getTime(),
            periodStart: new Date('2024-02-01').getTime(),
            periodEnd: new Date('2024-03-01').getTime(),
            pdf: '#',
            plan: 'Pro'
          }
        ];

        // Simulate API delay
        setTimeout(() => {
          setInvoices(mockInvoices);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message || 'Failed to fetch invoices');
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-white">Loading billing history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading billing history: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Billing History</h2>
        <p className="text-gray-400 mt-1">
          View and download your past invoices
        </p>
      </div>

      <div className="glass-effect rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Download
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {format(invoice.created, 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {invoice.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${(invoice.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-500/20 text-green-300' 
                          : invoice.status === 'pending' 
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {format(invoice.periodStart, 'MMM d')} - {format(invoice.periodEnd, 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <a 
                        href={invoice.pdf} 
                        className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingHistory;

