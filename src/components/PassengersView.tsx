import React, { useState } from 'react';
import { Passenger } from '../types';
import {
  Users,
  Search,
  Award,
  CreditCard,
  Phone,
  Mail,
  Ban,
  CheckCircle2,
  Gift,
  AlertTriangle,
} from 'lucide-react';

interface PassengersViewProps {
  passengers: Passenger[];
  onTogglePassengerStatus: (passengerId: string) => void;
  onIssuePromoCredit: (passengerId: string, amount: number) => void;
  currencySymbol: string;
}

export const PassengersView: React.FC<PassengersViewProps> = ({
  passengers,
  onTogglePassengerStatus,
  onIssuePromoCredit,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [promoAmount, setPromoAmount] = useState('10.00');
  const [creditingPassengerId, setCreditingPassengerId] = useState<string | null>(null);

  const filteredPassengers = passengers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="input-search-passengers"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search passenger name, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Registered Riders: <strong className="text-emerald-400">{passengers.length}</strong>
        </div>
      </div>

      {/* Passengers Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPassengers.map((passenger) => {
          const isFlagged = passenger.status === 'FLAGGED' || passenger.status === 'BANNED';

          return (
            <div
              key={passenger.id}
              id={`passenger-card-${passenger.id}`}
              className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                isFlagged
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={passenger.avatar}
                      alt={passenger.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{passenger.name}</h3>
                        {passenger.isVip && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5" /> VIP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{passenger.phone}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">★ {passenger.rating}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      passenger.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {passenger.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 my-3 py-2 bg-slate-950/60 rounded-xl text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500">Total Rides</div>
                    <div className="font-bold text-slate-200 font-mono">
                      {passenger.totalRides} trips
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Lifetime Spend</div>
                    <div className="font-bold text-emerald-400 font-mono">
                      {currencySymbol}
                      {passenger.spentTotal.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Payment</div>
                    <div className="font-semibold text-slate-300 text-[11px] truncate">
                      {passenger.paymentMethod}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                {creditingPassengerId === passenger.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={promoAmount}
                      onChange={(e) => setPromoAmount(e.target.value)}
                      className="w-16 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-emerald-400 font-mono"
                    />
                    <button
                      id={`btn-confirm-promo-${passenger.id}`}
                      onClick={() => {
                        onIssuePromoCredit(passenger.id, parseFloat(promoAmount) || 10);
                        setCreditingPassengerId(null);
                      }}
                      className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded"
                    >
                      Send {currencySymbol}
                    </button>
                    <button
                      onClick={() => setCreditingPassengerId(null)}
                      className="text-slate-500 text-xs hover:text-slate-300 px-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    id={`btn-issue-credit-${passenger.id}`}
                    onClick={() => setCreditingPassengerId(passenger.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Gift className="w-3 h-3" /> Issue Ride Credit
                  </button>
                )}

                <button
                  id={`btn-toggle-passenger-${passenger.id}`}
                  onClick={() => onTogglePassengerStatus(passenger.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isFlagged
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  }`}
                >
                  {isFlagged ? 'Unban Account' : 'Flag / Ban'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
