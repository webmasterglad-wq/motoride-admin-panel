import React, { useState } from 'react';
import { PayoutRequest, RideTrip } from '../types';
import {
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  XCircle,
  CreditCard,
  Building,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
} from 'lucide-react';

interface FinancePayoutsViewProps {
  payouts: PayoutRequest[];
  trips: RideTrip[];
  onApprovePayout: (payoutId: string) => void;
  onRejectPayout: (payoutId: string) => void;
  currencySymbol: string;
}

export const FinancePayoutsView: React.FC<FinancePayoutsViewProps> = ({
  payouts,
  trips,
  onApprovePayout,
  onRejectPayout,
  currencySymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'PAYOUTS' | 'LEDGER'>('PAYOUTS');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate high level metrics
  const totalGmv = trips.reduce((sum, t) => sum + t.finalFare, 0);
  const totalPlatformFees = trips.reduce((sum, t) => sum + t.platformCommissionAmount, 0);
  const totalDriverEarnings = trips.reduce((sum, t) => sum + t.driverPayout, 0);
  const pendingPayoutsTotal = payouts
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayouts = payouts.filter(
    (p) =>
      p.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCsv = () => {
    const headers = ['Trip ID', 'Service Type', 'Date', 'Gross Fare', 'Platform Take Rate', 'Platform Commission', 'Driver Net Payout', 'Payment Mode'];
    const rows = trips.map((t) => [
      t.trackingNumber,
      t.serviceType,
      t.createdAt,
      t.finalFare.toFixed(2),
      `${(t.platformCommissionRate * 100).toFixed(1)}%`,
      t.platformCommissionAmount.toFixed(2),
      t.driverPayout.toFixed(2),
      t.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ride_finance_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Financial Stats Grid */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            <span>Gross Merchandise Value (GMV)</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-slate-100 font-mono mt-1">
            {currencySymbol}
            {totalGmv.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Across {trips.length} active/recent rides</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            <span>Platform Net Revenue (Take)</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-blue-400 font-mono mt-1">
            {currencySymbol}
            {totalPlatformFees.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Avg Take Rate: ~16.2%</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            <span>Driver Payouts Distributed</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400 font-mono mt-1">
            {currencySymbol}
            {totalDriverEarnings.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Direct driver earnings</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            <span>Pending Cashouts Backlog</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">
            {currencySymbol}
            {pendingPayoutsTotal.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">
            {payouts.filter((p) => p.status === 'PENDING').length} requests awaiting approval
          </div>
        </div>
      </div>

      {/* Action / Tab Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              id="tab-payout-requests"
              onClick={() => setActiveTab('PAYOUTS')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'PAYOUTS'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Driver Instant Payouts Queue ({payouts.length})
            </button>
            <button
              id="tab-finance-ledger"
              onClick={() => setActiveTab('LEDGER')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'LEDGER'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Completed Ride Commission Ledger
            </button>
          </div>
        </div>

        <button
          id="btn-export-finance-csv"
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Export Financial Report (CSV)
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'PAYOUTS' ? (
          <div className="space-y-3">
            {filteredPayouts.map((payout) => {
              const isPending = payout.status === 'PENDING';

              return (
                <div
                  key={payout.id}
                  id={`payout-item-${payout.id}`}
                  className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 ${
                    isPending ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={payout.driverAvatar}
                      alt={payout.driverName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        {payout.driverName}
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded">
                          {payout.referenceCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        <span>{payout.payoutMethod.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{payout.accountDetails}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-black text-slate-100 font-mono">
                        {currencySymbol}
                        {payout.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Requested: {new Date(payout.requestedAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            id={`btn-approve-payout-${payout.id}`}
                            onClick={() => onApprovePayout(payout.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Payout
                          </button>
                          <button
                            id={`btn-reject-payout-${payout.id}`}
                            onClick={() => onRejectPayout(payout.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition-all"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          {payout.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Trip Tracking</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Rider / Driver</th>
                  <th className="p-3 text-right">Gross Fare</th>
                  <th className="p-3 text-right">Platform Cut</th>
                  <th className="p-3 text-right">Driver Payout</th>
                  <th className="p-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-200">{trip.trackingNumber}</td>
                    <td className="p-3 font-semibold text-slate-300">
                      {trip.serviceType === 'INDRIVE_FARE_BIDDING'
                        ? '⚡ inDrive Bidding'
                        : trip.serviceType === 'COURIER'
                        ? '📦 Courier'
                        : '🚗 Uber Auto'}
                    </td>
                    <td className="p-3">
                      <div>{trip.passenger.name}</div>
                      <div className="text-[10px] text-slate-500">{trip.driver?.name || 'Unassigned'}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">
                      {currencySymbol}
                      {trip.finalFare.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-blue-400">
                      {currencySymbol}
                      {trip.platformCommissionAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {currencySymbol}
                      {trip.driverPayout.toFixed(2)}
                    </td>
                    <td className="p-3 text-[11px] font-mono text-slate-400">{trip.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
