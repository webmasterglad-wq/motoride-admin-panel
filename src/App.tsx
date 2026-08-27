import React, { useState, useEffect, useRef } from 'react';
import {
  Driver,
  Passenger,
  RideTrip,
  SurgeZone,
  PayoutRequest,
  DisputeTicket,
  PlatformConfig,
  VehicleTier,
} from './types';
import {
  INITIAL_DRIVERS,
  INITIAL_PASSENGERS,
  INITIAL_TRIPS,
  INITIAL_SURGE_ZONES,
  INITIAL_PAYOUT_REQUESTS,
  INITIAL_DISPUTES,
  DEFAULT_PLATFORM_CONFIG,
} from './data/mockData';
import { Sidebar, AdminTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LiveFleetMap } from './components/LiveFleetMap';
import { TripsAndBiddingView } from './components/TripsAndBiddingView';
import { DriversKycView } from './components/DriversKycView';
import { PassengersView } from './components/PassengersView';
import { SurgeAndPricingMatrix } from './components/SurgeAndPricingMatrix';
import { SafetySosCenter } from './components/SafetySosCenter';
import { FinancePayoutsView } from './components/FinancePayoutsView';
import { AnalyticsView } from './components/AnalyticsView';
import { TripDetailModal } from './components/TripDetailModal';
import { NewTripModal } from './components/NewTripModal';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, X } from 'lucide-react';

export default function App() {
  // Master platform state
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('rideadmin_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const saved = localStorage.getItem('rideadmin_passengers');
    return saved ? JSON.parse(saved) : INITIAL_PASSENGERS;
  });

  const [trips, setTrips] = useState<RideTrip[]>(() => {
    const saved = localStorage.getItem('rideadmin_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [surgeZones, setSurgeZones] = useState<SurgeZone[]>(() => {
    const saved = localStorage.getItem('rideadmin_surgezones');
    return saved ? JSON.parse(saved) : INITIAL_SURGE_ZONES;
  });

  const [payouts, setPayouts] = useState<PayoutRequest[]>(() => {
    const saved = localStorage.getItem('rideadmin_payouts');
    return saved ? JSON.parse(saved) : INITIAL_PAYOUT_REQUESTS;
  });

  const [config, setConfig] = useState<PlatformConfig>(() => {
    const saved = localStorage.getItem('rideadmin_config');
    return saved ? JSON.parse(saved) : DEFAULT_PLATFORM_CONFIG;
  });

  // UI Navigation & selection
  const [currentTab, setCurrentTab] = useState<AdminTab>('FLEET_MAP');
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>('trip-9001');
  const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>('drv-101');
  const [inspectingTrip, setInspectingTrip] = useState<RideTrip | null>(null);

  // Modals
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Live simulation engine
  const [isSimulating, setIsSimulating] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO';
  } | null>(null);

  // Save to local storage for persistence
  useEffect(() => {
    localStorage.setItem('rideadmin_drivers', JSON.stringify(drivers));
    localStorage.setItem('rideadmin_trips', JSON.stringify(trips));
    localStorage.setItem('rideadmin_surgezones', JSON.stringify(surgeZones));
    localStorage.setItem('rideadmin_payouts', JSON.stringify(payouts));
    localStorage.setItem('rideadmin_config', JSON.stringify(config));
  }, [drivers, trips, surgeZones, payouts, config]);

  // Flash toast helper
  const showToast = (text: string, type: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO' = 'INFO') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4500);
  };

  // Real-time Simulation Interval
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 1. Move active and idle cars slightly around SF streets
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => {
          if (driver.status === 'OFFLINE' || driver.status === 'SUSPENDED') return driver;

          // random small delta: ~0.0003 deg (~30 meters)
          const latDelta = (Math.random() - 0.5) * 0.0007;
          const lngDelta = (Math.random() - 0.5) * 0.0007;
          const newHeading = Math.floor(Math.random() * 360);

          return {
            ...driver,
            currentLat: driver.currentLat + latDelta,
            currentLng: driver.currentLng + lngDelta,
            heading: newHeading,
          };
        })
      );

      // 2. Randomly simulate new inDrive driver counter-bids on active bidding trips
      setTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.status === 'BIDDING_ACTIVE' && Math.random() > 0.6) {
            const idleDrivers = drivers.filter((d) => d.status === 'ONLINE_IDLE');
            if (idleDrivers.length > 0) {
              const randomDriver = idleDrivers[Math.floor(Math.random() * idleDrivers.length)];
              const alreadyBid = trip.driverBids.some((b) => b.driverId === randomDriver.id);

              if (!alreadyBid) {
                const markupPercent = (Math.random() * 0.35); // 0% to +35%
                const bidFare = parseFloat((trip.passengerOfferedFare * (1 + markupPercent)).toFixed(2));
                const newBid = {
                  id: `bid-auto-${Date.now()}`,
                  driverId: randomDriver.id,
                  driverName: randomDriver.name,
                  driverAvatar: randomDriver.avatar,
                  rating: randomDriver.rating,
                  vehicleModel: `${randomDriver.vehicle.make} ${randomDriver.vehicle.model}`,
                  vehiclePlate: randomDriver.vehicle.plateNumber,
                  bidFare,
                  originalPassengerFare: trip.passengerOfferedFare,
                  etaMin: Math.floor(2 + Math.random() * 5),
                  timestamp: 'Just now',
                  status: 'PENDING' as const,
                };

                return {
                  ...trip,
                  driverBids: [newBid, ...trip.driverBids],
                };
              }
            }
          }
          return trip;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, drivers]);

  // Driver KYC Actions
  const handleApproveDriverKyc = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              kycStatus: 'VERIFIED',
              status: d.status === 'SUSPENDED' ? 'ONLINE_IDLE' : d.status,
              documents: d.documents.map((doc) => ({ ...doc, status: 'APPROVED' })),
            }
          : d
      )
    );
    showToast('Driver KYC approved and active fleet permissions enabled!', 'SUCCESS');
  };

  const handleRejectDriverKyc = (driverId: string, reason: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              kycStatus: 'REJECTED',
              status: 'SUSPENDED',
              documents: d.documents.map((doc) => ({ ...doc, status: 'REJECTED', notes: reason })),
            }
          : d
      )
    );
    showToast(`Driver verification declined: ${reason}`, 'WARNING');
  };

  const handleToggleDriverSuspension = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const willSuspend = d.status !== 'SUSPENDED';
          return {
            ...d,
            status: willSuspend ? 'SUSPENDED' : 'ONLINE_IDLE',
          };
        }
        return d;
      })
    );
  };

  const handleUpdateDriverTier = (driverId: string, tier: VehicleTier) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId ? { ...d, vehicle: { ...d.vehicle, tier } } : d
      )
    );
    showToast(`Driver vehicle tier updated to ${tier}`, 'INFO');
  };

  // Trip & inDrive Bidding Actions
  const handleAcceptDriverBid = (tripId: string, bidId: string) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        if (trip.id === tripId) {
          const targetBid = trip.driverBids.find((b) => b.id === bidId);
          if (!targetBid) return trip;

          const assignedDriver = drivers.find((d) => d.id === targetBid.driverId);
          const finalFare = targetBid.bidFare;
          const commissionAmount = parseFloat((finalFare * trip.platformCommissionRate).toFixed(2));
          const driverPayout = parseFloat((finalFare - commissionAmount).toFixed(2));

          return {
            ...trip,
            status: 'IN_PROGRESS',
            driver: assignedDriver,
            acceptedBidId: bidId,
            finalFare,
            platformCommissionAmount: commissionAmount,
            driverPayout,
            driverBids: trip.driverBids.map((b) => ({
              ...b,
              status: b.id === bidId ? 'ACCEPTED' : 'REJECTED',
            })),
            timeline: [
              ...trip.timeline,
              {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'BID_ACCEPTED_ADMIN',
                note: `Accepted ${targetBid.driverName} bid of ${config.currencySymbol}${finalFare.toFixed(2)}`,
              },
            ],
          };
        }
        return trip;
      })
    );

    showToast('inDrive Driver Bid accepted! Trip transitioned to In Progress.', 'SUCCESS');
  };

  const handleForceAssignDriver = (tripId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'IN_PROGRESS',
              driver,
              timeline: [
                ...t.timeline,
                {
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'FORCE_DISPATCHED',
                  note: `Admin directly assigned driver ${driver.name}`,
                },
              ],
            }
          : t
      )
    );

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'ONLINE_BUSY' } : d))
    );

    showToast(`Driver ${driver.name} force-dispatched to trip.`, 'SUCCESS');
  };

  const handleCancelTrip = (tripId: string, reason: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'CANCELLED',
              timeline: [
                ...t.timeline,
                {
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'CANCELLED_ADMIN',
                  note: reason,
                },
              ],
            }
          : t
      )
    );
    showToast(`Trip cancelled and passenger fee refunded.`, 'WARNING');
  };

  // Surge & Pricing Actions
  const handleUpdateZoneMultiplier = (zoneId: string, multiplier: number) => {
    setSurgeZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, currentMultiplier: multiplier } : z))
    );
  };

  const handleToggleZone = (zoneId: string) => {
    setSurgeZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isEnabled: !z.isEnabled } : z))
    );
  };

  const handleSimulateWeatherSurge = () => {
    setSurgeZones((prev) =>
      prev.map((z) => ({
        ...z,
        currentMultiplier: Math.min(4.0, parseFloat((z.currentMultiplier + 0.5).toFixed(2))),
      }))
    );
    showToast('Dynamic Weather Surge applied: +0.5x across all operational geofences!', 'INFO');
  };

  // Safety / SOS Actions
  const handleResolveSos = (tripId: string, alertId: string, actionNote: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              safetyAlerts: t.safetyAlerts.map((a) =>
                a.id === alertId
                  ? {
                      ...a,
                      resolved: true,
                      resolvedBy: 'Alex Rivera (Chief Dispatcher)',
                      resolvedAt: new Date().toLocaleTimeString(),
                      actionsTaken: [...(a.actionsTaken || []), actionNote],
                    }
                  : a
              ),
            }
          : t
      )
    );
    showToast('Emergency SOS marked resolved and incident filed.', 'SUCCESS');
  };

  const handleTriggerEmergencyTest = () => {
    const activeTrip = trips.find((t) => t.status === 'IN_PROGRESS') || trips[0];
    const newAlert = {
      id: `sos-sim-${Date.now()}`,
      triggeredBy: 'PASSENGER' as const,
      type: 'SOS_BUTTON' as const,
      severity: 'CRITICAL' as const,
      description: 'Simulated in-app panic alarm triggered by passenger. Priority safety team alerted.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false,
      actionsTaken: ['Automated telemetry trace initiated'],
    };

    setTrips((prev) =>
      prev.map((t) =>
        t.id === activeTrip.id
          ? {
              ...t,
              safetyAlerts: [newAlert, ...t.safetyAlerts],
            }
          : t
      )
    );

    setCurrentTab('SAFETY_SOS');
    showToast('🚨 SIMULATION: Emergency SOS Beacon Activated!', 'ALERT');
  };

  // Finance Actions
  const handleApprovePayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'APPROVED',
              processedAt: new Date().toISOString(),
            }
          : p
      )
    );
    showToast('Driver Instant Cashout approved and transfer broadcasted!', 'SUCCESS');
  };

  const handleRejectPayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === payoutId ? { ...p, status: 'REJECTED' } : p))
    );
    showToast('Payout request declined.', 'WARNING');
  };

  // Passenger Actions
  const handleTogglePassengerStatus = (passengerId: string) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.id === passengerId) {
          const willBan = p.status === 'ACTIVE';
          return {
            ...p,
            status: willBan ? 'FLAGGED' : 'ACTIVE',
          };
        }
        return p;
      })
    );
  };

  const handleIssuePromoCredit = (passengerId: string, amount: number) => {
    showToast(`Issued ${config.currencySymbol}${amount.toFixed(2)} ride credit to passenger!`, 'SUCCESS');
  };

  const handleResetData = () => {
    setDrivers(INITIAL_DRIVERS);
    setPassengers(INITIAL_PASSENGERS);
    setTrips(INITIAL_TRIPS);
    setSurgeZones(INITIAL_SURGE_ZONES);
    setPayouts(INITIAL_PAYOUT_REQUESTS);
    setConfig(DEFAULT_PLATFORM_CONFIG);
    localStorage.clear();
    showToast('All platform and fleet data reset to initial benchmark state.', 'INFO');
  };

  // Key Counts
  const activeSosCount = trips.reduce(
    (count, t) => count + t.safetyAlerts.filter((a) => !a.resolved).length,
    0
  );
  const pendingKycCount = drivers.filter((d) => d.kycStatus === 'PENDING').length;
  const activeBiddingCount = trips.filter((t) => t.status === 'BIDDING_ACTIVE').length;
  const activeTripsCount = trips.filter(
    (t) => t.status === 'IN_PROGRESS' || t.status === 'DRIVER_ASSIGNED' || t.status === 'ARRIVED_PICKUP'
  ).length;
  const onlineDriversCount = drivers.filter((d) => d.status !== 'OFFLINE' && d.status !== 'SUSPENDED')
    .length;

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold animate-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'ALERT'
              ? 'bg-red-950/90 border-red-500 text-red-200'
              : toastMessage.type === 'SUCCESS'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : toastMessage.type === 'WARNING'
              ? 'bg-amber-950/90 border-amber-500 text-amber-200'
              : 'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}
        >
          {toastMessage.type === 'ALERT' ? (
            <ShieldAlert className="w-4 h-4 text-red-400" />
          ) : toastMessage.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : toastMessage.type === 'WARNING' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-400" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingKycCount={pendingKycCount}
        activeSosCount={activeSosCount}
        activeBiddingCount={activeBiddingCount}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Executive Top Navbar */}
        <Navbar
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          onOpenNewTripModal={() => setShowNewTripModal(true)}
          onTriggerEmergencyTest={handleTriggerEmergencyTest}
          onResetSimulationData={handleResetData}
          activeSosCount={activeSosCount}
          activeTripsCount={activeTripsCount}
          onlineDriversCount={onlineDriversCount}
          activeBiddingCount={activeBiddingCount}
        />

        {/* Tab View Container */}
        <main className="flex-1 overflow-hidden relative">
          {currentTab === 'FLEET_MAP' && (
            <LiveFleetMap
              drivers={drivers}
              trips={trips}
              surgeZones={surgeZones}
              selectedTripId={selectedTripId}
              selectedDriverId={selectedDriverId}
              onSelectDriver={(driver) => {
                setSelectedDriverId(driver.id);
                showToast(`Focused on driver ${driver.name} (${driver.vehicle.model})`, 'INFO');
              }}
              onSelectTrip={(trip) => {
                setSelectedTripId(trip.id);
                setInspectingTrip(trip);
              }}
              onSelectZone={(zone) => {
                showToast(`Geofence Zone: ${zone.name} (${zone.currentMultiplier}x Surge)`, 'INFO');
              }}
              currencySymbol={config.currencySymbol}
            />
          )}

          {currentTab === 'TRIPS_BIDDING' && (
            <TripsAndBiddingView
              trips={trips}
              drivers={drivers}
              selectedTripId={selectedTripId}
              onSelectTrip={(trip) => {
                setSelectedTripId(trip.id);
                setCurrentTab('FLEET_MAP');
              }}
              onAcceptDriverBid={handleAcceptDriverBid}
              onForceAssignDriver={handleForceAssignDriver}
              onCancelTrip={handleCancelTrip}
              onOpenTripModal={setInspectingTrip}
              currencySymbol={config.currencySymbol}
            />
          )}

          {currentTab === 'DRIVERS_KYC' && (
            <DriversKycView
              drivers={drivers}
              onApproveDriverKyc={handleApproveDriverKyc}
              onRejectDriverKyc={handleRejectDriverKyc}
              onToggleDriverSuspension={handleToggleDriverSuspension}
              onUpdateDriverTier={handleUpdateDriverTier}
              onSelectDriverForMap={(driver) => {
                setSelectedDriverId(driver.id);
                setCurrentTab('FLEET_MAP');
              }}
              currencySymbol={config.currencySymbol}
            />
          )}

          {currentTab === 'PASSENGERS' && (
            <PassengersView
              passengers={passengers}
              onTogglePassengerStatus={handleTogglePassengerStatus}
              onIssuePromoCredit={handleIssuePromoCredit}
              currencySymbol={config.currencySymbol}
            />
          )}

          {currentTab === 'SURGE_PRICING' && (
            <SurgeAndPricingMatrix
              surgeZones={surgeZones}
              config={config}
              onUpdateZoneMultiplier={handleUpdateZoneMultiplier}
              onToggleZone={handleToggleZone}
              onUpdateConfig={(newConf) => setConfig({ ...config, ...newConf })}
              onAddNewZone={(newZone) => {
                setSurgeZones([newZone, ...surgeZones]);
                showToast(`New Surge Zone "${newZone.name}" deployed!`, 'SUCCESS');
              }}
              onSimulateWeatherSurge={handleSimulateWeatherSurge}
              currencySymbol={config.currencySymbol}
            />
          )}

          {currentTab === 'SAFETY_SOS' && (
            <SafetySosCenter
              trips={trips}
              onResolveSos={handleResolveSos}
              onSelectTripOnMap={(trip) => {
                setSelectedTripId(trip.id);
                setCurrentTab('FLEET_MAP');
              }}
              sosEmergencyPhone={config.sosEmergencyPhoneNumber}
            />
          )}

          {currentTab === 'FINANCE' && (
            <FinancePayoutsView
              payouts={payouts}
              trips={trips}
              onApprovePayout={handleApprovePayout}
              onRejectPayout={handleRejectPayout}
              currencySymbol={config.currencySymbol}
            />
          )}

          {currentTab === 'ANALYTICS' && (
            <AnalyticsView
              trips={trips}
              drivers={drivers}
              surgeZones={surgeZones}
              currencySymbol={config.currencySymbol}
            />
          )}
        </main>
      </div>

      {/* Slide-over / Modal for Trip Inspection */}
      {inspectingTrip && (
        <TripDetailModal
          trip={inspectingTrip}
          onClose={() => setInspectingTrip(null)}
          onSelectOnMap={(trip) => {
            setSelectedTripId(trip.id);
            setCurrentTab('FLEET_MAP');
          }}
          currencySymbol={config.currencySymbol}
        />
      )}

      {/* New Trip Simulation Modal */}
      {showNewTripModal && (
        <NewTripModal
          passengers={passengers}
          drivers={drivers}
          surgeZones={surgeZones}
          onClose={() => setShowNewTripModal(false)}
          onCreateTrip={(newTrip) => {
            setTrips([newTrip, ...trips]);
            setSelectedTripId(newTrip.id);
            showToast(`Dispatched simulated trip #${newTrip.trackingNumber}`, 'SUCCESS');
          }}
          currencySymbol={config.currencySymbol}
        />
      )}

      {/* Platform Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          config={config}
          onClose={() => setShowSettingsModal(false)}
          onSaveConfig={(newConfig) => {
            setConfig(newConfig);
            showToast('Platform settings saved successfully.', 'SUCCESS');
          }}
        />
      )}
    </div>
  );
}
