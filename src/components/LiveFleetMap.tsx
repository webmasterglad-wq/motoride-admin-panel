import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Driver, RideTrip, SurgeZone, VehicleTier } from '../types';
import { Car, Layers, Zap, AlertTriangle, Crosshair, Sparkles, SlidersHorizontal, MapPin, Eye } from 'lucide-react';

interface LiveFleetMapProps {
  drivers: Driver[];
  trips: RideTrip[];
  surgeZones: SurgeZone[];
  selectedTripId?: string;
  selectedDriverId?: string;
  onSelectDriver: (driver: Driver) => void;
  onSelectTrip: (trip: RideTrip) => void;
  onSelectZone?: (zone: SurgeZone) => void;
  currencySymbol: string;
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({
  drivers,
  trips,
  surgeZones,
  selectedTripId,
  selectedDriverId,
  onSelectDriver,
  onSelectTrip,
  onSelectZone,
  currencySymbol,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routesGroupRef = useRef<L.LayerGroup | null>(null);
  const zonesGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [showDrivers, setShowDrivers] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showSurgeZones, setShowSurgeZones] = useState(true);
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.4194],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl =
      mapTheme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups for clean updates
    const zonesGroup = L.layerGroup().addTo(map);
    const routesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    zonesGroupRef.current = zonesGroup;
    routesGroupRef.current = routesGroup;
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map tile theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const tileUrl =
      mapTheme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapTheme]);

  // Render Surge Geofences
  useEffect(() => {
    if (!zonesGroupRef.current) return;
    zonesGroupRef.current.clearLayers();

    if (!showSurgeZones) return;

    surgeZones.forEach((zone) => {
      if (!zone.isEnabled) return;

      const circle = L.circle([zone.centerLat, zone.centerLng], {
        radius: zone.radiusMeters,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '4, 8',
      });

      // Custom badge marker in center of surge zone
      const surgeBadgeHtml = `
        <div class="cursor-pointer group flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-amber-400 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md transition-all text-xs font-semibold whitespace-nowrap -translate-x-1/2 -translate-y-1/2">
          <span class="w-2 h-2 rounded-full ${
            zone.currentMultiplier > 1.8 ? 'bg-red-500 animate-ping' : 'bg-amber-400'
          }"></span>
          <span class="text-amber-300 font-bold tracking-tight">${zone.currentMultiplier.toFixed(1)}x</span>
          <span class="text-slate-300 font-mono text-[10px] hidden group-hover:inline">${zone.name}</span>
        </div>
      `;

      const badgeIcon = L.divIcon({
        className: 'surge-badge-container',
        html: surgeBadgeHtml,
        iconSize: [0, 0],
      });

      const badgeMarker = L.marker([zone.centerLat, zone.centerLng], { icon: badgeIcon });
      badgeMarker.on('click', () => {
        if (onSelectZone) onSelectZone(zone);
      });

      circle.on('click', () => {
        if (onSelectZone) onSelectZone(zone);
      });

      circle.addTo(zonesGroupRef.current!);
      badgeMarker.addTo(zonesGroupRef.current!);
    });
  }, [surgeZones, showSurgeZones, onSelectZone]);

  // Render Active Trip Route Lines and Pickup/Dropoff Pins
  useEffect(() => {
    if (!routesGroupRef.current) return;
    routesGroupRef.current.clearLayers();

    if (!showRoutes) return;

    trips.forEach((trip) => {
      const isSelected = trip.id === selectedTripId;
      const isSos = trip.safetyAlerts.some((a) => !a.resolved);
      const isBidding = trip.status === 'BIDDING_ACTIVE';

      // Pickup Pin
      const pickupIcon = L.divIcon({
        className: 'pickup-pin',
        html: `
          <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-full">
            <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-md ${
              isSelected ? 'ring-4 ring-emerald-400' : ''
            }">
              <span class="text-[10px] font-black">P</span>
            </div>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
              <div class="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
                <strong>Pickup:</strong> ${trip.passenger.name} (${currencySymbol}${trip.finalFare.toFixed(2)})
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const pickupMarker = L.marker([trip.origin.lat, trip.origin.lng], { icon: pickupIcon });
      pickupMarker.on('click', () => onSelectTrip(trip));
      pickupMarker.addTo(routesGroupRef.current!);

      // Dropoff Pin (for active/in-progress trips)
      if (trip.status === 'IN_PROGRESS' || trip.status === 'DRIVER_ASSIGNED' || isSelected) {
        const dropoffIcon = L.divIcon({
          className: 'dropoff-pin',
          html: `
            <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-full">
              <div class="w-6 h-6 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-md">
                <span class="text-[10px] font-black">D</span>
              </div>
            </div>
          `,
          iconSize: [0, 0],
        });

        const dropoffMarker = L.marker([trip.destination.lat, trip.destination.lng], { icon: dropoffIcon });
        dropoffMarker.on('click', () => onSelectTrip(trip));
        dropoffMarker.addTo(routesGroupRef.current!);

        // Polyline
        if (trip.routePoints && trip.routePoints.length > 0) {
          const polyline = L.polyline(trip.routePoints, {
            color: isSos ? '#ef4444' : isSelected ? '#10b981' : isBidding ? '#f59e0b' : '#3b82f6',
            weight: isSelected ? 5 : 3.5,
            opacity: isSelected ? 0.95 : 0.7,
            dashArray: trip.status === 'BIDDING_ACTIVE' ? '6, 6' : undefined,
          });

          polyline.on('click', () => onSelectTrip(trip));
          polyline.addTo(routesGroupRef.current!);
        }
      }
    });
  }, [trips, selectedTripId, showRoutes, onSelectTrip, currencySymbol]);

  // Render Driver Vehicle Markers with Real-time Angle Heading
  useEffect(() => {
    if (!markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    if (!showDrivers) return;

    const filteredDrivers = drivers.filter((driver) => {
      if (tierFilter === 'ALL') return true;
      return driver.vehicle.tier === tierFilter;
    });

    filteredDrivers.forEach((driver) => {
      const isSelected = driver.id === selectedDriverId;
      const isBusy = driver.status === 'ONLINE_BUSY' || driver.status === 'EN_ROUTE';
      const isIdle = driver.status === 'ONLINE_IDLE';
      const isSuspended = driver.status === 'SUSPENDED';

      const statusBg = isSuspended
        ? 'bg-red-600 border-red-400'
        : isBusy
        ? 'bg-blue-600 border-blue-400'
        : isIdle
        ? 'bg-emerald-500 border-emerald-300'
        : 'bg-slate-600 border-slate-400';

      const markerHtml = `
        <div id="driver-marker-${driver.id}" class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
          <!-- Vehicle orientation circle -->
          <div class="relative w-8 h-8 rounded-full ${statusBg} border-2 flex items-center justify-center text-white shadow-xl transition-transform duration-300 ${
            isSelected ? 'ring-4 ring-emerald-400 scale-125 z-40' : 'hover:scale-110'
          }">
            <svg class="w-4 h-4" style="transform: rotate(${driver.heading}deg);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
            ${
              driver.biddingAllowed
                ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950" title="inDrive Bidding Enabled"></span>`
                : ''
            }
          </div>

          <!-- Tooltip on hover -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
            <div class="bg-slate-900/95 border border-slate-700/80 backdrop-blur-md text-slate-100 text-xs px-3 py-1.5 rounded-lg shadow-2xl min-w-[140px] text-center">
              <div class="font-semibold text-slate-100">${driver.name}</div>
              <div class="text-[11px] text-slate-400">${driver.vehicle.make} ${driver.vehicle.model} • <span class="text-amber-300">★ ${driver.rating}</span></div>
              <div class="text-[10px] font-mono mt-0.5 ${isIdle ? 'text-emerald-400' : 'text-blue-400'} uppercase font-bold tracking-wider">
                ${driver.status.replace('_', ' ')}
              </div>
            </div>
            <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
          </div>
        </div>
      `;

      const carIcon = L.divIcon({
        className: 'driver-car-marker',
        html: markerHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([driver.currentLat, driver.currentLng], { icon: carIcon });
      marker.on('click', () => onSelectDriver(driver));
      marker.addTo(markersGroupRef.current!);
    });
  }, [drivers, selectedDriverId, showDrivers, tierFilter, onSelectDriver]);

  // Center on selected item
  const focusOnCoordinates = (lat: number, lng: number, zoom = 15) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 overflow-hidden select-none">
      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)]">
        {/* Tier filter pill bar */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1 rounded-xl shadow-xl">
          {(['ALL', 'Economy', 'Comfort', 'Black / XL', 'Moto', 'Freight / Delivery'] as const).map((tier) => (
            <button
              key={tier}
              id={`filter-tier-${tier.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setTierFilter(tier)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                tierFilter === tier
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tier === 'ALL' ? 'All Fleet' : tier}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-2 py-1 rounded-xl shadow-xl text-xs">
          <button
            id="toggle-show-drivers"
            onClick={() => setShowDrivers(!showDrivers)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
              showDrivers ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Live Driver Markers"
          >
            <Car className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Drivers</span>
          </button>
          <button
            id="toggle-show-routes"
            onClick={() => setShowRoutes(!showRoutes)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
              showRoutes ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Active Route Lines"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Routes</span>
          </button>
          <button
            id="toggle-show-surge"
            onClick={() => setShowSurgeZones(!showSurgeZones)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
              showSurgeZones ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Dynamic Surge & Bidding Zones"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Surge</span>
          </button>
        </div>
      </div>

      {/* Top Right Map Style & Quick Preset Control */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
        <button
          id="toggle-map-theme"
          onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="capitalize">{mapTheme} Mode</span>
        </button>
      </div>

      {/* Bottom Left City Hub Quick Jumps */}
      <div className="absolute bottom-4 left-3.5 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-xl text-xs text-slate-400">
        <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
          <Crosshair className="w-3 h-3 text-emerald-400" /> Presets:
        </span>
        <button
          id="btn-focus-downtown"
          onClick={() => focusOnCoordinates(37.7897, -122.3972, 14)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          Downtown Hub
        </button>
        <button
          id="btn-focus-sfo"
          onClick={() => focusOnCoordinates(37.6213, -122.3790, 13)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          SFO Airport
        </button>
        <button
          id="btn-focus-mission"
          onClick={() => focusOnCoordinates(37.7650, -122.4180, 14)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          Mission District
        </button>
      </div>

      {/* Floating Live Fleet Stat Badge on Map (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-4 bg-slate-900/90 border border-slate-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400">Available Cars:</span>
          <strong className="text-emerald-400 font-mono">
            {drivers.filter((d) => d.status === 'ONLINE_IDLE').length}
          </strong>
        </div>
        <div className="w-px h-3.5 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-400">Active Rides:</span>
          <strong className="text-blue-400 font-mono">
            {trips.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'DRIVER_ASSIGNED').length}
          </strong>
        </div>
        <div className="w-px h-3.5 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="text-slate-400">Bidding Rounds:</span>
          <strong className="text-amber-400 font-mono">
            {trips.filter((t) => t.status === 'BIDDING_ACTIVE').length}
          </strong>
        </div>
      </div>
    </div>
  );
};
