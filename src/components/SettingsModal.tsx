import React, { useState } from 'react';
import { PlatformConfig } from '../types';
import { Settings, X, Save, Shield, Phone, DollarSign, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  config: PlatformConfig;
  onClose: () => void;
  onSaveConfig: (newConfig: PlatformConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onClose,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<PlatformConfig>({ ...config });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
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
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Ride Platform Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Currency Symbol</label>
              <select
                id="select-currency-symbol"
                value={formData.currencySymbol}
                onChange={(e) =>
                  setFormData({ ...formData, currencySymbol: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              >
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="₱">₱ (PHP)</option>
                <option value="R$">R$ (BRL)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Auto-Dispatch Radius (KM)
              </label>
              <input
                id="input-dispatch-radius"
                type="number"
                step="0.5"
                value={formData.autoDispatchRadiusKm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    autoDispatchRadiusKm: parseFloat(e.target.value) || 4.5,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              911 / SOS Emergency Response Hot-Line
            </label>
            <input
              id="input-emergency-phone"
              type="text"
              value={formData.sosEmergencyPhoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, sosEmergencyPhoneNumber: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              inDrive Bidding Timeout (Seconds)
            </label>
            <input
              id="input-bidding-timeout"
              type="number"
              value={formData.biddingTimeLimitSeconds}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  biddingTimeLimitSeconds: parseInt(e.target.value) || 60,
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAiFraudDetection}
                onChange={(e) =>
                  setFormData({ ...formData, enableAiFraudDetection: e.target.checked })
                }
                className="rounded bg-slate-950 border-slate-700 text-emerald-500"
              />
              <span className="text-slate-300">Enable AI GPS Spoofing & Fraud Detection</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableDynamicWeatherSurge}
                onChange={(e) =>
                  setFormData({ ...formData, enableDynamicWeatherSurge: e.target.checked })
                }
                className="rounded bg-slate-950 border-slate-700 text-emerald-500"
              />
              <span className="text-slate-300">Auto-Apply Rain/Weather Dynamic Surge</span>
            </label>
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
            id="btn-save-settings"
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
