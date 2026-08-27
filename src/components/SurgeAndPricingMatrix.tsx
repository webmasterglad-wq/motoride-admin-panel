import React, { useState } from 'react';
import { SurgeZone, PlatformConfig } from '../types';
import {
  Zap,
  Sliders,
  DollarSign,
  CloudRain,
  Flame,
  Percent,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Gavel,
  RefreshCw,
} from 'lucide-react';

interface SurgeAndPricingMatrixProps {
  surgeZones: SurgeZone[];
  config: PlatformConfig;
  onUpdateZoneMultiplier: (zoneId: string, multiplier: number) => void;
  onToggleZone: (zoneId: string) => void;
  onUpdateConfig: (newConfig: Partial<PlatformConfig>) => void;
  onAddNewZone: (zone: SurgeZone) => void;
  onSimulateWeatherSurge: () => void;
  currencySymbol: string;
}

export const SurgeAndPricingMatrix: React.FC<SurgeAndPricingMatrixProps> = ({
  surgeZones,
  config,
  onUpdateZoneMultiplier,
  onToggleZone,
  onUpdateConfig,
  onAddNewZone,
  onSimulateWeatherSurge,
  currencySymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'ZONES' | 'COMMISSIONS' | 'BIDDING_RULES'>('ZONES');
  const [weatherSimulating, setWeatherSimulating] = useState(false);
  const [showNewZoneModal, setShowNewZoneModal] = useState(false);

  // New Zone Form State
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneLat, setNewZoneLat] = useState('37.7749');
  const [newZoneLng, setNewZoneLng] = useState('-122.4194');
  const [newZoneRadius, setNewZoneRadius] = useState('1500');
  const [newZoneMultiplier, setNewZoneMultiplier] = useState('1.5');
  const [newZoneColor, setNewZoneColor] = useState('#f97316');

  const handleSimulateWeather = () => {
    setWeatherSimulating(true);
    onSimulateWeatherSurge();
    setTimeout(() => {
      setWeatherSimulating(false);
    }, 1200);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    const newZone: SurgeZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName,
      centerLat: parseFloat(newZoneLat) || 37.7749,
      centerLng: parseFloat(newZoneLng) || -122.4194,
      radiusMeters: parseInt(newZoneRadius) || 1500,
      currentMultiplier: parseFloat(newZoneMultiplier) || 1.5,
      demandLevel: parseFloat(newZoneMultiplier) > 1.8 ? 'SURGE_EXTREME' : 'HIGH',
      activeDriversCount: 15,
      waitingRequestsCount: 30,
      minBidFloor: 12.0,
      maxBidCeilingPercent: 40,
      isEnabled: true,
      color: newZoneColor,
    };

    onAddNewZone(newZone);
    setShowNewZoneModal(false);
    setNewZoneName('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              id="tab-pricing-zones"
              onClick={() => setActiveTab('ZONES')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'ZONES'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Surge Geofence Zones ({surgeZones.length})
            </button>
            <button
              id="tab-pricing-commissions"
              onClick={() => setActiveTab('COMMISSIONS')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'COMMISSIONS'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Platform Take Rates & Commissions
            </button>
            <button
              id="tab-pricing-bidding-rules"
              onClick={() => setActiveTab('BIDDING_RULES')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'BIDDING_RULES'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              inDrive Dynamic Bidding Corridor Rules
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-simulate-weather-surge"
            onClick={handleSimulateWeather}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all"
          >
            <CloudRain className={`w-3.5 h-3.5 ${weatherSimulating ? 'animate-bounce' : ''}`} />
            <span>Simulate Rain Surge (+0.5x)</span>
          </button>

          <button
            id="btn-open-new-zone-modal"
            onClick={() => setShowNewZoneModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Surge Geofence
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'ZONES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surgeZones.map((zone) => {
              const isExtreme = zone.currentMultiplier >= 2.0;

              return (
                <div
                  key={zone.id}
                  id={`surge-zone-card-${zone.id}`}
                  className={`bg-slate-900/80 border rounded-2xl p-4 transition-all duration-200 ${
                    zone.isEnabled
                      ? isExtreme
                        ? 'border-red-500/50 bg-red-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                      : 'border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{zone.name}</h3>
                        <p className="text-xs text-slate-400">
                          Radius: {zone.radiusMeters}m • ({zone.centerLat.toFixed(4)},{' '}
                          {zone.centerLng.toFixed(4)})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-toggle-zone-${zone.id}`}
                        onClick={() => onToggleZone(zone.id)}
                        className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all ${
                          zone.isEnabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {zone.isEnabled ? 'ENABLED' : 'PAUSED'}
                      </button>
                    </div>
                  </div>

                  {/* Multiplier Slider */}
                  <div className="my-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Surge Dynamic Multiplier:
                      </span>
                      <span className="text-lg font-black font-mono text-amber-300">
                        {zone.currentMultiplier.toFixed(2)}x
                      </span>
                    </div>

                    <input
                      id={`slider-surge-${zone.id}`}
                      type="range"
                      min="1.0"
                      max="4.0"
                      step="0.1"
                      value={zone.currentMultiplier}
                      disabled={!zone.isEnabled}
                      onChange={(e) =>
                        onUpdateZoneMultiplier(zone.id, parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1.0x (Standard)</span>
                      <span>2.0x (Rush Peak)</span>
                      <span>3.0x (Extreme)</span>
                      <span>4.0x (Emergency Max)</span>
                    </div>
                  </div>

                  {/* Zone Demands Stats */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Active Supply</div>
                      <div className="font-bold text-emerald-400 font-mono">
                        {zone.activeDriversCount} cars
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Unfulfilled Demand</div>
                      <div className="font-bold text-amber-400 font-mono">
                        {zone.waitingRequestsCount} riders
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">inDrive Fare Floor</div>
                      <div className="font-bold text-slate-200 font-mono">
                        {currencySymbol}
                        {zone.minBidFloor.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'COMMISSIONS' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 max-w-3xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-400" />
                Platform Commission Take-Rates
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure the platform slice deducted from each completed ride across dispatch models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Uber Auto-Dispatch Commission */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    🚗 Uber Algorithm Dispatch
                  </div>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {config.uberCommissionRate}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Standard upfront dynamic pricing with automated dispatch.
                </p>
                <input
                  id="input-uber-commission"
                  type="range"
                  min="10"
                  max="35"
                  step="0.5"
                  value={config.uberCommissionRate}
                  onChange={(e) =>
                    onUpdateConfig({ uberCommissionRate: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* inDrive Bidding Commission */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-amber-300 flex items-center gap-2">
                    ⚡ inDrive Dynamic Bidding
                  </div>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {config.inDriveCommissionRate}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Low fee structure designed for driver empowerment and competitive bids.
                </p>
                <input
                  id="input-indrive-commission"
                  type="range"
                  min="5"
                  max="20"
                  step="0.5"
                  value={config.inDriveCommissionRate}
                  onChange={(e) =>
                    onUpdateConfig({ inDriveCommissionRate: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Courier Delivery */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-purple-300 flex items-center gap-2">
                    📦 Courier & Parcel Delivery
                  </div>
                  <span className="text-sm font-black text-purple-400 font-mono">
                    {config.courierCommissionRate}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  On-demand package delivery with photo drop-off confirmation.
                </p>
                <input
                  id="input-courier-commission"
                  type="range"
                  min="8"
                  max="25"
                  step="0.5"
                  value={config.courierCommissionRate}
                  onChange={(e) =>
                    onUpdateConfig({ courierCommissionRate: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* City-to-City Intercity */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-blue-300 flex items-center gap-2">
                    🛣️ City-to-City Freight & Travel
                  </div>
                  <span className="text-sm font-black text-blue-400 font-mono">
                    {config.cityToCityCommissionRate}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Long-haul passenger rides and freight cargo transfers.
                </p>
                <input
                  id="input-intercity-commission"
                  type="range"
                  min="5"
                  max="15"
                  step="0.5"
                  value={config.cityToCityCommissionRate}
                  onChange={(e) =>
                    onUpdateConfig({ cityToCityCommissionRate: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'BIDDING_RULES' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 max-w-3xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                inDrive Dynamic Bidding Corridor Parameters
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Protect passenger experience while allowing open-market price discovery for drivers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Max Allowed Driver Counter-Bid Markup
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Prevents drivers from bidding predatory prices above passenger's offer.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    +{config.maxDriverBidIncreasePercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Bidding Window Time Limit
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Seconds allowed for passenger to review and pick among incoming driver bids.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {config.biddingTimeLimitSeconds} seconds
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    AI Fraud & Fake Bid Bot Prevention
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Detects suspicious coordinated driver bid rings or automated GPS spoofers.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="checkbox-ai-fraud-detection"
                    type="checkbox"
                    checked={config.enableAiFraudDetection}
                    onChange={(e) =>
                      onUpdateConfig({ enableAiFraudDetection: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Geofence Zone Modal */}
      {showNewZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateZone}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Add New Surge Zone
              </h3>
              <button
                type="button"
                onClick={() => setShowNewZoneModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Zone Name</label>
                <input
                  id="input-new-zone-name"
                  type="text"
                  required
                  placeholder="e.g. Levi's Stadium Event District"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Center Lat</label>
                  <input
                    type="text"
                    value={newZoneLat}
                    onChange={(e) => setNewZoneLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Center Lng</label>
                  <input
                    type="text"
                    value={newZoneLng}
                    onChange={(e) => setNewZoneLng(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Radius (Meters)</label>
                  <input
                    type="number"
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Initial Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="4.0"
                    value={newZoneMultiplier}
                    onChange={(e) => setNewZoneMultiplier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Map Accent Color</label>
                <div className="flex items-center gap-2">
                  {['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#a855f7'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewZoneColor(c)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newZoneColor === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewZoneModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                id="btn-submit-new-zone"
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Deploy Zone
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
