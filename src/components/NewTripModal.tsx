import React, { useState } from 'react';
import { Passenger, Driver, RideTrip, SurgeZone } from '../types';
import { Car, Gavel, MapPin, DollarSign, X, Sparkles, Navigation } from 'lucide-react';

interface NewTripModalProps {
  passengers: Passenger[];
  drivers: Driver[];
  surgeZones: SurgeZone[];
  onClose: () => void;
  onCreateTrip: (newTrip: RideTrip) => void;
  currencySymbol: string;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  passengers,
  drivers,
  surgeZones,
  onClose,
  onCreateTrip,
  currencySymbol,
}) => {
  const [serviceType, setServiceType] = useState<'INDRIVE_FARE_BIDDING' | 'UBER_AUTO_DISPATCH' | 'COURIER'>('INDRIVE_FARE_BIDDING');
  const [selectedPassengerId, setSelectedPassengerId] = useState(passengers[0]?.id || '');
  const [originName, setOriginName] = useState('Embarcadero Ferry Building');
  const [originAddress, setOriginAddress] = useState('1 Ferry Building, San Francisco, CA 94105');
  const [originLat, setOriginLat] = useState(37.7955);
  const [originLng, setOriginLng] = useState(-122.3937);

  const [destinationName, setDestinationName] = useState('Golden Gate Park Conservatory');
  const [destinationAddress, setDestinationAddress] = useState('100 John F Kennedy Dr, San Francisco, CA 94118');
  const [destLat, setDestLat] = useState(37.7725);
  const [destLng, setDestLng] = useState(-122.4608);

  const [offeredFare, setOfferedFare] = useState('18.00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passenger = passengers.find((p) => p.id === selectedPassengerId) || passengers[0];
    const fareNum = parseFloat(offeredFare) || 18.0;

    // Pick 2 random nearby drivers to simulate counter bids if inDrive
    const availableDrivers = drivers.filter((d) => d.status === 'ONLINE_IDLE');
    const mockBids = serviceType === 'INDRIVE_FARE_BIDDING'
      ? availableDrivers.slice(0, 3).map((d, i) => ({
          id: `bid-new-${Date.now()}-${i}`,
          driverId: d.id,
          driverName: d.name,
          driverAvatar: d.avatar,
          rating: d.rating,
          vehicleModel: `${d.vehicle.make} ${d.vehicle.model}`,
          vehiclePlate: d.vehicle.plateNumber,
          bidFare: parseFloat((fareNum * (1 + (i * 0.15))).toFixed(2)),
          originalPassengerFare: fareNum,
          etaMin: (i + 1) * 3,
          timestamp: 'Just now',
          status: 'PENDING' as const,
        }))
      : [];

    const newTrip: RideTrip = {
      id: `trip-${Date.now()}`,
      trackingNumber: `TRP-${Math.floor(1000 + Math.random() * 9000)}-SF`,
      serviceType,
      status: serviceType === 'INDRIVE_FARE_BIDDING' ? 'BIDDING_ACTIVE' : 'IN_PROGRESS',
      passenger,
      driver: serviceType === 'UBER_AUTO_DISPATCH' ? availableDrivers[0] : undefined,
      origin: {
        name: originName,
        address: originAddress,
        lat: originLat,
        lng: originLng,
      },
      destination: {
        name: destinationName,
        address: destinationAddress,
        lat: destLat,
        lng: destLng,
      },
      currentLat: originLat,
      currentLng: originLng,
      distanceKm: 6.8,
      estimatedDurationMin: 22,
      routePoints: [
        [originLat, originLng],
        [37.7850, -122.4200],
        [destLat, destLng],
      ],
      passengerOfferedFare: fareNum,
      driverBids: mockBids,
      finalFare: fareNum,
      baseFare: 5.0,
      distanceFare: fareNum - 5.0,
      surgeMultiplier: 1.0,
      platformCommissionRate: serviceType === 'INDRIVE_FARE_BIDDING' ? 0.095 : 0.22,
      platformCommissionAmount: parseFloat((fareNum * (serviceType === 'INDRIVE_FARE_BIDDING' ? 0.095 : 0.22)).toFixed(2)),
      driverPayout: parseFloat((fareNum * (1 - (serviceType === 'INDRIVE_FARE_BIDDING' ? 0.095 : 0.22))).toFixed(2)),
      paymentMethod: passenger.paymentMethod,
      isPaid: false,
      safetyAlerts: [],
      telemetry: {
        currentSpeedKmH: 35,
        maxSpeedKmH: 45,
        hardBrakesCount: 0,
        routeDeviationMeters: 0,
      },
      timeline: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: serviceType === 'INDRIVE_FARE_BIDDING' ? 'BIDDING_OPEN' : 'AUTO_DISPATCHED',
          note: `New ${serviceType.replace(/_/g, ' ')} initiated by admin simulator.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Simulate / Dispatch New Ride</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setServiceType('INDRIVE_FARE_BIDDING')}
            className={`p-3 rounded-xl border text-left transition-all ${
              serviceType === 'INDRIVE_FARE_BIDDING'
                ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold text-xs flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-amber-400" /> inDrive Bidding
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Passenger offers fare, drivers counter-bid.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setServiceType('UBER_AUTO_DISPATCH')}
            className={`p-3 rounded-xl border text-left transition-all ${
              serviceType === 'UBER_AUTO_DISPATCH'
                ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold text-xs flex items-center gap-1.5">
              <Car className="w-4 h-4 text-blue-400" /> Uber Auto-Dispatch
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Upfront price & immediate driver match.
            </div>
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Select Passenger</label>
            <select
              id="select-new-trip-passenger"
              value={selectedPassengerId}
              onChange={(e) => setSelectedPassengerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            >
              {passengers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (★ {p.rating}) • {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Pickup Location</label>
            <input
              id="input-new-trip-origin"
              type="text"
              required
              value={originName}
              onChange={(e) => setOriginName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Dropoff Destination</label>
            <input
              id="input-new-trip-destination"
              type="text"
              required
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              {serviceType === 'INDRIVE_FARE_BIDDING' ? 'Passenger Offered Fare' : 'Upfront Fixed Fare'} ({currencySymbol})
            </label>
            <input
              id="input-new-trip-fare"
              type="number"
              step="0.5"
              required
              value={offeredFare}
              onChange={(e) => setOfferedFare(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-sm font-bold text-emerald-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
          >
            Cancel
          </button>
          <button
            id="btn-submit-new-trip"
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Launch Ride Simulation
          </button>
        </div>
      </form>
    </div>
  );
};
