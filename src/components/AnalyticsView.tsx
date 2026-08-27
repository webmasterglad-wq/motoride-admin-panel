import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RideTrip, Driver, SurgeZone } from '../types';
import {
  TrendingUp,
  Activity,
  Users,
  Car,
  DollarSign,
  Gavel,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AnalyticsViewProps {
  trips: RideTrip[];
  drivers: Driver[];
  surgeZones: SurgeZone[];
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trips,
  drivers,
  surgeZones,
  currencySymbol,
}) => {
  // Realistic hourly dispatch metrics
  const hourlyData = [
    { time: '00:00', uberTrips: 18, inDriveTrips: 12, gmv: 620 },
    { time: '02:00', uberTrips: 12, inDriveTrips: 8, gmv: 380 },
    { time: '04:00', uberTrips: 8, inDriveTrips: 5, gmv: 240 },
    { time: '06:00', uberTrips: 34, inDriveTrips: 22, gmv: 980 },
    { time: '08:00', uberTrips: 86, inDriveTrips: 64, gmv: 2840 },
    { time: '10:00', uberTrips: 54, inDriveTrips: 45, gmv: 1720 },
    { time: '12:00', uberTrips: 68, inDriveTrips: 58, gmv: 2150 },
    { time: '14:00', uberTrips: 59, inDriveTrips: 51, gmv: 1890 },
    { time: '16:00', uberTrips: 92, inDriveTrips: 78, gmv: 3420 },
    { time: '18:00', uberTrips: 110, inDriveTrips: 95, gmv: 4190 },
    { time: '20:00', uberTrips: 74, inDriveTrips: 62, gmv: 2650 },
    { time: '22:00', uberTrips: 48, inDriveTrips: 39, gmv: 1680 },
  ];

  // Service distribution
  const serviceDistribution = [
    { name: 'Uber Auto Dispatch', value: 52, color: '#3b82f6' },
    { name: 'inDrive Dynamic Bidding', value: 38, color: '#f59e0b' },
    { name: 'Courier & Parcel', value: 7, color: '#a855f7' },
    { name: 'City-to-City Freight', value: 3, color: '#10b981' },
  ];

  // Vehicle Tier Breakdown
  const tierDistribution = [
    { name: 'Economy', count: drivers.filter((d) => d.vehicle.tier === 'Economy').length },
    { name: 'Comfort', count: drivers.filter((d) => d.vehicle.tier === 'Comfort').length },
    { name: 'Black / XL', count: drivers.filter((d) => d.vehicle.tier === 'Black / XL').length },
    { name: 'Moto', count: drivers.filter((d) => d.vehicle.tier === 'Moto').length },
    { name: 'Freight / Van', count: drivers.filter((d) => d.vehicle.tier === 'Freight / Delivery').length },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* Top Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Bidding Success Rate</span>
            <Gavel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            87.4%
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Avg 2.4 counter-bids per trip</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Avg Pickup ETA</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            3.8 min
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">-0.6 min vs yesterday</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Surge Premium Multiplier</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            1.42x
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Peak in Financial District (2.2x)</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Driver Retention Rate</span>
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">
            94.1%
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">+3.2% from low inDrive fee</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Volume Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Hourly Ride Volume: Uber Dispatch vs inDrive Bidding
              </h3>
              <p className="text-xs text-slate-400">
                Tracking hourly demand peaks and dispatch split across 24h cycle
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInDrive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uberTrips"
                  name="Uber Auto Dispatch"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorUber)"
                />
                <Area
                  type="monotone"
                  dataKey="inDriveTrips"
                  name="inDrive Bidding"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorInDrive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dispatch Model Pie Breakdown (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Service Model Share
            </h3>
            <p className="text-xs text-slate-400">Passenger trip preferences</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {serviceDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Tier Distribution Bar Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Car className="w-4 h-4 text-purple-400" />
          Active Fleet Vehicle Classification Breakdown
        </h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Active Drivers" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
