import React from 'react';
import { RideTrip, Driver } from '../types';
import {
  X,
  MapPin,
  Car,
  User,
  ShieldCheck,
  ShieldAlert,
  Gavel,
  DollarSign,
  Clock,
  Navigation,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface TripDetailModalProps {
  trip: RideTrip | null;
  onClose: () => void;
  onSelectOnMap: (trip: RideTrip) => void;
  currencySymbol: string;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  onClose,
  onSelectOnMap,
  currencySymbol,
}) => {
  if (!trip) return null;

  const isInDrive = trip.serviceType === 'INDRIVE_FARE_BIDDING';
  const isSos = trip.safetyAlerts.some((a) => !a.resolved);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-slate-100 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-sm">
              {trip.trackingNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Ride Telemetry & Audit Dossier</h2>
                {isInDrive ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    ⚡ inDrive Bidding
                  </span>
                ) : (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                    🚗 Uber Auto-Dispatch
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Created: {new Date(trip.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-modal-view-on-map"
              onClick={() => {
                onSelectOnMap(trip);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" /> View on Map
            </button>
            <button
              id="btn-close-trip-modal"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Route Segment Overview */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">Pickup Origin</div>
              <div className="text-xs text-slate-300 font-semibold">{trip.origin.name}</div>
              <div className="text-[11px] text-slate-500">{trip.origin.address}</div>
            </div>
          </div>

          <div className="ml-1.5 border-l-2 border-dashed border-slate-700 pl-4 py-1 text-[11px] font-mono text-slate-400">
            <span>📏 Distance: {trip.distanceKm} km</span> • <span>⏱️ Duration: ~{trip.estimatedDurationMin} mins</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">Dropoff Destination</div>
              <div className="text-xs text-slate-300 font-semibold">{trip.destination.name}</div>
              <div className="text-[11px] text-slate-500">{trip.destination.address}</div>
            </div>
          </div>
        </div>

        {/* Rider & Driver Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Rider */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <img
              src={trip.passenger.avatar}
              alt={trip.passenger.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-700"
            />
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                {trip.passenger.name}
                {trip.passenger.isVip && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    VIP
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">{trip.passenger.phone}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ★ {trip.passenger.rating} • {trip.passenger.totalRides} lifetime rides
              </div>
            </div>
          </div>

          {/* Driver */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            {trip.driver ? (
              <>
                <img
                  src={trip.driver.avatar}
                  alt={trip.driver.name}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-500/50"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200">{trip.driver.name}</div>
                  <div className="text-xs text-slate-400">{trip.driver.phone}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {trip.driver.vehicle.make} {trip.driver.vehicle.model} ({trip.driver.vehicle.plateNumber}) • ★ {trip.driver.rating}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 italic p-2">Driver matching in progress</div>
            )}
          </div>
        </div>

        {/* Fare Accounting Breakdown */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Financial Breakdown & Platform Take
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-900 rounded-lg">
              <div className="text-slate-500 text-[10px]">Base Fare</div>
              <div className="font-mono font-bold text-slate-200">
                {currencySymbol}
                {trip.baseFare.toFixed(2)}
              </div>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg">
              <div className="text-slate-500 text-[10px]">Distance & Time</div>
              <div className="font-mono font-bold text-slate-200">
                {currencySymbol}
                {trip.distanceFare.toFixed(2)}
              </div>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg">
              <div className="text-slate-500 text-[10px]">Surge Multiplier</div>
              <div className="font-mono font-bold text-amber-400">{trip.surgeMultiplier}x</div>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg">
              <div className="text-slate-500 text-[10px]">Final Gross Fare</div>
              <div className="font-mono font-black text-emerald-400 text-sm">
                {currencySymbol}
                {trip.finalFare.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Platform Take ({(trip.platformCommissionRate * 100).toFixed(1)}%):
            </span>
            <span className="font-mono font-bold text-blue-400">
              {currencySymbol}
              {trip.platformCommissionAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Driver Net Earnings:</span>
            <span className="font-mono font-bold text-emerald-400">
              {currencySymbol}
              {trip.driverPayout.toFixed(2)}
            </span>
          </div>
        </div>

        {/* inDrive Bidding Transcript (if applicable) */}
        {isInDrive && trip.driverBids && trip.driverBids.length > 0 && (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/40 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
              inDrive Dynamic Bidding History
            </h4>

            <div className="space-y-2">
              <div className="text-xs text-slate-300">
                Passenger initial proposal:{' '}
                <strong className="text-emerald-400 font-mono">
                  {currencySymbol}
                  {trip.passengerOfferedFare.toFixed(2)}
                </strong>
              </div>

              <div className="space-y-1.5">
                {trip.driverBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <img src={bid.driverAvatar} alt="" className="w-5 h-5 rounded-full" />
                      <span className="font-semibold text-slate-200">{bid.driverName}</span>
                      <span className="text-slate-500">({bid.vehicleModel})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-300">
                        {currencySymbol}
                        {bid.bidFare.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          bid.status === 'ACCEPTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Telemetry Sensor Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Sensor Telematics & Anomaly Detection
          </h4>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded-lg">
              <div className="text-[10px] text-slate-500">Live Speed</div>
              <div className="font-mono font-bold text-slate-200">
                {trip.telemetry.currentSpeedKmH} km/h
              </div>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg">
              <div className="text-[10px] text-slate-500">Max Trip Speed</div>
              <div className="font-mono font-bold text-slate-200">
                {trip.telemetry.maxSpeedKmH} km/h
              </div>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg">
              <div className="text-[10px] text-slate-500">Hard Brakes</div>
              <div className="font-mono font-bold text-amber-400">
                {trip.telemetry.hardBrakesCount}
              </div>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg">
              <div className="text-[10px] text-slate-500">Route Deviation</div>
              <div className="font-mono font-bold text-slate-200">
                {trip.telemetry.routeDeviationMeters} m
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Trip Event Audit Trail
          </h4>
          <div className="space-y-1.5">
            {trip.timeline.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800/80"
              >
                <span className="font-mono text-slate-500 text-[11px]">{item.time}</span>
                <span className="font-semibold text-emerald-400">{item.status}</span>
                <span className="text-slate-400">{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
