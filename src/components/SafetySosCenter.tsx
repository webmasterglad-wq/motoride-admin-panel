import React, { useState } from 'react';
import { RideTrip, SafetyAlert } from '../types';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Volume2,
  Lock,
  Compass,
  Activity,
  User,
  Car,
  ExternalLink,
} from 'lucide-react';

interface SafetySosCenterProps {
  trips: RideTrip[];
  onResolveSos: (tripId: string, alertId: string, actionNote: string) => void;
  onSelectTripOnMap: (trip: RideTrip) => void;
  sosEmergencyPhone: string;
}

export const SafetySosCenter: React.FC<SafetySosCenterProps> = ({
  trips,
  onResolveSos,
  onSelectTripOnMap,
  sosEmergencyPhone,
}) => {
  const [audioStreamSimulating, setAudioStreamSimulating] = useState<string | null>(null);
  const [resolveActionNote, setResolveActionNote] = useState('Safety check completed with rider & driver. Situation safe.');
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

  // Extract all safety alerts across all trips
  const allAlerts: Array<{ trip: RideTrip; alert: SafetyAlert }> = [];
  trips.forEach((trip) => {
    trip.safetyAlerts.forEach((alert) => {
      allAlerts.push({ trip, alert });
    });
  });

  const activeAlerts = allAlerts.filter((item) => !item.alert.resolved);
  const resolvedAlerts = allAlerts.filter((item) => item.alert.resolved);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Critical Safety & Emergency Response Center
            </h2>
            <p className="text-xs text-slate-400">
              Live SOS triggers, AI crash telemetry, and route deviation monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-950/40 border border-red-500/50 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-300 font-bold">
              {activeAlerts.length} Active Emergency Alerts
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            911 Direct Line: <strong className="text-red-400">{sosEmergencyPhone}</strong>
          </div>
        </div>
      </div>

      {/* Main Alert Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeAlerts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-bold text-slate-200">All Fleet Vehicles Normal</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              No active SOS alarms, severe route deviations, or crash deceleration anomalies detected on live sensors.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              Active Critical Incidents ({activeAlerts.length})
            </div>

            {activeAlerts.map(({ trip, alert }) => (
              <div
                key={alert.id}
                id={`safety-alert-card-${alert.id}`}
                className="bg-red-950/20 border-2 border-red-500/80 rounded-2xl p-5 shadow-2xl space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg animate-pulse">
                      {alert.type.replace('_', ' ')}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        Trip #{trip.trackingNumber} • {trip.serviceType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-red-300 flex items-center gap-2 mt-0.5">
                        <span>Triggered By: <strong>{alert.triggeredBy}</strong></span>
                        <span>•</span>
                        <span>Time: {alert.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-sos-track-map-${trip.id}`}
                      onClick={() => onSelectTripOnMap(trip)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 shadow-md"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Lock GPS Vehicle Track
                    </button>

                    <button
                      id={`btn-simulate-audio-${alert.id}`}
                      onClick={() =>
                        setAudioStreamSimulating(
                          audioStreamSimulating === alert.id ? null : alert.id
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {audioStreamSimulating === alert.id ? 'Mute Stream' : 'Live In-Car Audio Link'}
                    </button>
                  </div>
                </div>

                {/* Alert Description */}
                <div className="bg-slate-900/90 border border-red-900/50 p-3 rounded-xl text-xs text-slate-200 leading-relaxed">
                  <strong className="text-red-400">Incident Report:</strong> {alert.description}
                </div>

                {/* Live Audio Stream Simulation Wave */}
                {audioStreamSimulating === alert.id && (
                  <div className="bg-slate-950 border border-blue-500/40 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="font-mono text-blue-300 font-bold">
                        AUDIO FEED STREAMING (ENCRYPTED DISPATCH)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[40, 70, 30, 90, 60, 80, 50, 95, 30, 75, 45].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-400 rounded-full animate-pulse"
                          style={{ height: `${h / 3}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Telemetry Sensor Dashboard for this vehicle */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-xl text-center text-xs">
                  <div>
                    <div className="text-slate-500 text-[10px]">Speed Telemetry</div>
                    <div className="font-mono font-bold text-slate-200 text-sm">
                      {trip.telemetry.currentSpeedKmH} km/h
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Hard Braking Count</div>
                    <div className="font-mono font-bold text-amber-400 text-sm">
                      {trip.telemetry.hardBrakesCount} events
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Route Deviation</div>
                    <div className="font-mono font-bold text-red-400 text-sm">
                      {trip.telemetry.routeDeviationMeters} m
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Safety Protocol</div>
                    <div className="font-bold text-emerald-400 text-xs flex items-center justify-center gap-1 mt-0.5">
                      <Lock className="w-3 h-3" /> Locked
                    </div>
                  </div>
                </div>

                {/* Passenger & Driver Quick Contact */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={trip.passenger.avatar}
                        alt={trip.passenger.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-slate-200">{trip.passenger.name} (Rider)</div>
                        <div className="text-[10px] text-slate-400">{trip.passenger.phone}</div>
                      </div>
                    </div>

                    {trip.driver && (
                      <div className="flex items-center gap-2">
                        <img
                          src={trip.driver.avatar}
                          alt={trip.driver.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-200">{trip.driver.name} (Driver)</div>
                          <div className="text-[10px] text-slate-400">{trip.driver.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resolution Input / Button */}
                  <div className="flex items-center gap-2">
                    {resolvingAlertId === alert.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={resolveActionNote}
                          onChange={(e) => setResolveActionNote(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 w-64"
                        />
                        <button
                          id={`btn-confirm-resolve-sos-${alert.id}`}
                          onClick={() => {
                            onResolveSos(trip.id, alert.id, resolveActionNote);
                            setResolvingAlertId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-resolve-sos-${alert.id}`}
                        onClick={() => setResolvingAlertId(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                      >
                        Mark SOS Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolved Safety Incident History */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
            Safety Incident Resolution Log ({resolvedAlerts.length})
          </h4>

          <div className="space-y-2">
            {resolvedAlerts.map(({ trip, alert }) => (
              <div
                key={alert.id}
                className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">
                      Trip #{trip.trackingNumber} • {alert.type}
                    </div>
                    <div className="text-[11px] text-slate-400">{alert.description}</div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>Resolved by: {alert.resolvedBy || 'Safety Admin'}</div>
                  <div>{alert.resolvedAt || 'Earlier today'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
