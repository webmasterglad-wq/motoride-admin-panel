import React from 'react';
import {
  Compass,
  MapPin,
  Car,
  Gavel,
  ShieldCheck,
  Users,
  Zap,
  ShieldAlert,
  DollarSign,
  BarChart3,
  Settings,
  Flame,
} from 'lucide-react';

export type AdminTab =
  | 'FLEET_MAP'
  | 'TRIPS_BIDDING'
  | 'DRIVERS_KYC'
  | 'PASSENGERS'
  | 'SURGE_PRICING'
  | 'SAFETY_SOS'
  | 'FINANCE'
  | 'ANALYTICS';

interface SidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingKycCount: number;
  activeSosCount: number;
  activeBiddingCount: number;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingKycCount,
  activeSosCount,
  activeBiddingCount,
  onOpenSettings,
}) => {
  const navItems = [
    {
      id: 'FLEET_MAP' as AdminTab,
      label: 'Live Fleet & GPS Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'TRIPS_BIDDING' as AdminTab,
      label: 'Trips & Fare Bidding',
      icon: Gavel,
      badge: activeBiddingCount > 0 ? `${activeBiddingCount} bids` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'DRIVERS_KYC' as AdminTab,
      label: 'Drivers & KYC Pipeline',
      icon: ShieldCheck,
      badge: pendingKycCount > 0 ? `${pendingKycCount} review` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'PASSENGERS' as AdminTab,
      label: 'Passenger Directory',
      icon: Users,
      badge: null,
    },
    {
      id: 'SURGE_PRICING' as AdminTab,
      label: 'Surge & Pricing Matrix',
      icon: Zap,
      badge: 'Dynamic',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 'SAFETY_SOS' as AdminTab,
      label: 'Safety & SOS Center',
      icon: ShieldAlert,
      badge: activeSosCount > 0 ? `${activeSosCount} SOS` : null,
      badgeColor: 'bg-red-600 text-white animate-pulse',
    },
    {
      id: 'FINANCE' as AdminTab,
      label: 'Finance & Payouts',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'ANALYTICS' as AdminTab,
      label: 'Forecasting & Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between select-none z-20 flex-shrink-0">
      {/* Brand logo */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-100 tracking-tight">
              <span>RideAdmin</span>
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded font-mono border border-emerald-500/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>Uber</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">inDrive</span>
              <span className="text-slate-600">•</span>
              <span>Courier</span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id.toLowerCase()}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Config */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          id="btn-sidebar-settings"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Platform Settings</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v2.6</span>
        </button>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate">Alex Rivera</div>
            <div className="text-[10px] text-emerald-400 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Chief Dispatcher
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
