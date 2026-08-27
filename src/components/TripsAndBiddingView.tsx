import React, { useState } from 'react';
import { RideTrip, Driver, Passenger, ServiceMode } from '../types';
import {
  Car,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  User,
  Zap,
  DollarSign,
  Gavel,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Phone,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface TripsAndBiddingViewProps {
  trips: RideTrip[];
  drivers: Driver[];
  selectedTripId?: string;
  onSelectTrip: (trip: RideTrip) => void;
  onAcceptDriverBid: (tripId: string, bidId: string) => void;
  onForceAssignDriver: (tripId: string, driverId: string) => void;
  onCancelTrip: (tripId: string, reason: string) => void;
  onOpenTripModal: (trip: RideTrip) => void;
  currencySymbol: string;
}

export const TripsAndBiddingView: React.FC<TripsAndBiddingViewProps> = ({
  trips,
  drivers,
  selectedTripId,
  onSelectTrip,
  onAcceptDriverBid,
  onForceAssignDriver,
  onCancelTrip,
  onOpenTripModal,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('ALL');
  const [assigningTripId, setAssigningTripId] = useState<string | null>(null);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trip.driver && trip.driver.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      trip.origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? trip.status === 'BIDDING_ACTIVE' || trip.status === 'DRIVER_ASSIGNED' || trip.status === 'IN_PROGRESS' || trip.status === 'ARRIVED_PICKUP'
        : trip.status === statusFilter;

    const matchesService =
      serviceTypeFilter === 'ALL' ? true : trip.serviceType === serviceTypeFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  const availableDrivers = drivers.filter(
    (d) => d.status === 'ONLINE_IDLE' && d.kycStatus === 'VERIFIED'
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Filter & Action Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="input-search-trips"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tracking #, rider, driver, address..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {[
              { id: 'ALL', label: 'All Trips' },
              { id: 'ACTIVE', label: 'Active Now' },
              { id: 'BIDDING_ACTIVE', label: 'Bidding War ⚡' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'DISPUTED', label: 'Disputes & SOS 🚨' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-trip-status-${tab.id.toLowerCase()}`}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Service Model Filter */}
          <select
            id="select-service-filter"
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Dispatch Types</option>
            <option value="INDRIVE_FARE_BIDDING">⚡ inDrive Bidding</option>
            <option value="UBER_AUTO_DISPATCH">🚗 Uber Auto Dispatch</option>
            <option value="COURIER">📦 Courier & Delivery</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Showing: <strong className="text-emerald-400">{filteredTrips.length}</strong> trips</span>
        </div>
      </div>

      {/* Trips Grid / List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
            <Car className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-medium">No ride trips match your current filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setServiceTypeFilter('ALL');
              }}
              className="mt-2 text-xs text-emerald-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            const isBiddingActive = trip.status === 'BIDDING_ACTIVE';
            const isSos = trip.safetyAlerts.some((a) => !a.resolved);
            const isInDrive = trip.serviceType === 'INDRIVE_FARE_BIDDING';

            return (
              <div
                key={trip.id}
                id={`trip-card-${trip.id}`}
                className={`bg-slate-900/80 hover:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 ${
                  isSos
                    ? 'border-red-500/70 bg-red-950/10 ring-1 ring-red-500/50'
                    : isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Trip Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded-md">
                      {trip.trackingNumber}
                    </span>
                    {isInDrive ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <Gavel className="w-3 h-3" /> inDrive Bidding
                      </span>
                    ) : trip.serviceType === 'COURIER' ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                        📦 Courier
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                        🚗 Uber Dispatch
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        trip.status === 'BIDDING_ACTIVE'
                          ? 'bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/40'
                          : trip.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : trip.status === 'DRIVER_ASSIGNED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : trip.status === 'COMPLETED'
                          ? 'bg-slate-800 text-slate-300'
                          : trip.status === 'DISPUTED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {trip.status.replace('_', ' ')}
                    </span>

                    {isSos && (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                        <ShieldAlert className="w-3 h-3" /> SOS ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Fare and Commission summary */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400 font-mono">
                        {currencySymbol}
                        {trip.finalFare.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fee: {currencySymbol}
                        {trip.platformCommissionAmount.toFixed(2)} ({(trip.platformCommissionRate * 100).toFixed(1)}%)
                      </div>
                    </div>
                    <button
                      id={`btn-open-trip-modal-${trip.id}`}
                      onClick={() => onOpenTripModal(trip)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="View Complete Telemetry & Logs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Trip Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3">
                  {/* Origin & Destination (5 cols) */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {trip.origin.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {trip.origin.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {trip.destination.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {trip.destination.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                      <span>📏 {trip.distanceKm} km</span>
                      <span>⏱️ ~{trip.estimatedDurationMin} mins</span>
                      {trip.surgeMultiplier > 1 && (
                        <span className="text-amber-400 font-bold">🔥 {trip.surgeMultiplier}x Surge</span>
                      )}
                    </div>
                  </div>

                  {/* Rider & Driver Info (4 cols) */}
                  <div className="md:col-span-4 flex items-center justify-between border-t md:border-t-0 md:border-l md:border-r border-slate-800/80 px-0 md:px-3">
                    {/* Passenger */}
                    <div className="flex items-center gap-2">
                      <img
                        src={trip.passenger.avatar}
                        alt={trip.passenger.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                          {trip.passenger.name}
                          {trip.passenger.isVip && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">VIP</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">★ {trip.passenger.rating} • {trip.paymentMethod}</div>
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />

                    {/* Driver */}
                    {trip.driver ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={trip.driver.avatar}
                          alt={trip.driver.name}
                          className="w-9 h-9 rounded-full object-cover border border-emerald-500/40"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{trip.driver.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {trip.driver.vehicle.model} ({trip.driver.vehicle.plateNumber})
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs text-amber-400 font-semibold flex items-center justify-end gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Matching...
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {trip.driverBids.length} bids pending
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons (3 cols) */}
                  <div className="md:col-span-3 flex flex-col justify-center gap-2">
                    <button
                      id={`btn-track-map-${trip.id}`}
                      onClick={() => onSelectTrip(trip)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-slate-700/60 transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Track on Live Map
                    </button>

                    {trip.status === 'BIDDING_ACTIVE' && (
                      <button
                        id={`btn-manual-assign-${trip.id}`}
                        onClick={() =>
                          setAssigningTripId(assigningTripId === trip.id ? null : trip.id)
                        }
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-500/40 transition-all"
                      >
                        <User className="w-3.5 h-3.5" />
                        Force Dispatch Driver
                      </button>
                    )}

                    {trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
                      <button
                        id={`btn-cancel-trip-${trip.id}`}
                        onClick={() => onCancelTrip(trip.id, 'Admin intervention cancellation')}
                        className="w-full text-center text-[10px] text-rose-400 hover:text-rose-300 hover:underline py-0.5"
                      >
                        Cancel Ride with Refund
                      </button>
                    )}
                  </div>
                </div>

                {/* inDrive Bidding Table (Expanded if inDrive and has bids) */}
                {isInDrive && trip.driverBids && trip.driverBids.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-slate-800/80 bg-slate-950/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Gavel className="w-3.5 h-3.5 text-amber-400" />
                        inDrive Dynamic Bidding Feed:
                        <span className="text-[11px] text-slate-400 font-normal">
                          Passenger offered{' '}
                          <strong className="text-emerald-400">
                            {currencySymbol}
                            {trip.passengerOfferedFare.toFixed(2)}
                          </strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-400/80 font-mono">
                        {trip.driverBids.length} counter-offers received
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {trip.driverBids.map((bid) => {
                        const diffPercent = Math.round(
                          ((bid.bidFare - bid.originalPassengerFare) / bid.originalPassengerFare) * 100
                        );

                        return (
                          <div
                            key={bid.id}
                            id={`bid-item-${bid.id}`}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                              bid.status === 'ACCEPTED'
                                ? 'bg-emerald-950/30 border-emerald-500/60'
                                : 'bg-slate-900/90 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <img
                                  src={bid.driverAvatar}
                                  alt={bid.driverName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <div className="truncate">
                                  <div className="text-xs font-semibold text-slate-200 truncate">
                                    {bid.driverName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {bid.vehicleModel}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs font-bold text-amber-300 font-mono">
                                  {currencySymbol}
                                  {bid.bidFare.toFixed(2)}
                                </div>
                                <span
                                  className={`text-[9px] font-mono ${
                                    diffPercent > 0 ? 'text-amber-400' : 'text-emerald-400'
                                  }`}
                                >
                                  {diffPercent > 0 ? `+${diffPercent}%` : 'Match'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                              <span>⏱️ ETA: {bid.etaMin}m</span>
                              {bid.status === 'ACCEPTED' ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Accepted
                                </span>
                              ) : isBiddingActive ? (
                                <button
                                  id={`btn-accept-bid-${bid.id}`}
                                  onClick={() => onAcceptDriverBid(trip.id, bid.id)}
                                  className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shadow-sm transition-all"
                                >
                                  Accept For Rider
                                </button>
                              ) : (
                                <span className="text-slate-500">{bid.status}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manual Assign Driver Dropdown Panel */}
                {assigningTripId === trip.id && (
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Select Available Driver to Override & Auto-Dispatch:
                    </div>
                    {availableDrivers.length === 0 ? (
                      <p className="text-xs text-slate-500">No idle drivers currently nearby.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {availableDrivers.map((driver) => (
                          <div
                            key={driver.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={driver.avatar}
                                alt={driver.name}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              <div className="truncate">
                                <div className="text-xs font-semibold text-slate-200 truncate">
                                  {driver.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {driver.vehicle.model} • ★ {driver.rating}
                                </div>
                              </div>
                            </div>
                            <button
                              id={`btn-assign-driver-${driver.id}-to-${trip.id}`}
                              onClick={() => {
                                onForceAssignDriver(trip.id, driver.id);
                                setAssigningTripId(null);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                            >
                              Dispatch
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
