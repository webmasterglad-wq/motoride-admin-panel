import React from 'react';
import {
  Play,
  Pause,
  Plus,
  Radio,
  Bell,
  ShieldAlert,
  Sparkles,
  Zap,
  Globe,
  Gavel,
  Car,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onOpenNewTripModal: () => void;
  onTriggerEmergencyTest: () => void;
  onResetSimulationData: () => void;
  activeSosCount: number;
  activeTripsCount: number;
  onlineDriversCount: number;
  activeBiddingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSimulating,
  onToggleSimulation,
  onOpenNewTripModal,
  onTriggerEmergencyTest,
  onResetSimulationData,
  activeSosCount,
  activeTripsCount,
  onlineDriversCount,
  activeBiddingCount,
}) => {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-4 flex items-center justify-between gap-3 z-30 select-none">
      {/* Left Quick Status Chips */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-slate-200">San Francisco Metro Hub</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Live Metrics Ticker */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-blue-400" />
            <span>Active:</span>
            <strong className="text-slate-200">{activeTripsCount}</strong>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            <span>Bidding:</span>
            <strong className="text-amber-400">{activeBiddingCount}</strong>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drivers Online:</span>
            <strong className="text-emerald-400">{onlineDriversCount}</strong>
          </div>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Emergency Beacon if SOS Active */}
        {activeSosCount > 0 && (
          <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-500/80 px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>{activeSosCount} EMERGENCY SOS</span>
          </div>
        )}

        {/* Live Simulation Play/Pause Toggle */}
        <button
          id="btn-toggle-simulation"
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
            isSimulating
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Toggle live vehicle GPS movement and auto-bidding simulation"
        >
          {isSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Sim Active (Live)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Sim</span>
            </>
          )}
        </button>

        {/* Simulate New Trip */}
        <button
          id="btn-open-new-trip-modal"
          onClick={onOpenNewTripModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dispatch Ride</span>
        </button>

        {/* Trigger Test Emergency */}
        <button
          id="btn-trigger-test-sos"
          onClick={onTriggerEmergencyTest}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-900/60 text-xs font-semibold transition-all"
          title="Simulate a passenger/driver emergency SOS trigger"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Test SOS</span>
        </button>

        {/* Reset Data button */}
        <button
          id="btn-reset-simulation-data"
          onClick={onResetSimulationData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Reset Simulation to Initial State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
