import React, { useState } from 'react';
import { Driver, DocumentItem, KycStatus, VehicleTier } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Car,
  Ban,
  Unlock,
  Award,
  ExternalLink,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DriversKycViewProps {
  drivers: Driver[];
  onApproveDriverKyc: (driverId: string) => void;
  onRejectDriverKyc: (driverId: string, reason: string) => void;
  onToggleDriverSuspension: (driverId: string) => void;
  onUpdateDriverTier: (driverId: string, tier: VehicleTier) => void;
  onSelectDriverForMap: (driver: Driver) => void;
  currencySymbol: string;
}

export const DriversKycView: React.FC<DriversKycViewProps> = ({
  drivers,
  onApproveDriverKyc,
  onRejectDriverKyc,
  onToggleDriverSuspension,
  onUpdateDriverTier,
  onSelectDriverForMap,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kycTab, setKycTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [inspectingDriver, setInspectingDriver] = useState<Driver | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<DocumentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Expired or invalid documentation');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKyc = kycTab === 'ALL' ? true : driver.kycStatus === kycTab;

    return matchesSearch && matchesKyc;
  });

  const pendingCount = drivers.filter((d) => d.kycStatus === 'PENDING').length;

  const handleApproveWithCelebration = (driverId: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onApproveDriverKyc(driverId);
    if (inspectingDriver && inspectingDriver.id === driverId) {
      setInspectingDriver({ ...inspectingDriver, kycStatus: 'VERIFIED', status: 'ONLINE_IDLE' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="input-search-drivers"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search driver name, phone, plate #, model..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* KYC Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              id="tab-kyc-pending"
              onClick={() => setKycTab('PENDING')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                kycTab === 'PENDING'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="bg-amber-400/30 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              id="tab-kyc-verified"
              onClick={() => setKycTab('VERIFIED')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                kycTab === 'VERIFIED'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Active Verified ({drivers.filter((d) => d.kycStatus === 'VERIFIED').length})
            </button>
            <button
              id="tab-kyc-rejected"
              onClick={() => setKycTab('REJECTED')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                kycTab === 'REJECTED'
                  ? 'bg-rose-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Rejected / Suspended
            </button>
            <button
              id="tab-kyc-all"
              onClick={() => setKycTab('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                kycTab === 'ALL'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              All Drivers ({drivers.length})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Fleet: <strong className="text-emerald-400">{drivers.length}</strong> drivers
        </div>
      </div>

      {/* Driver Cards List */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center h-64 text-slate-500">
            <ShieldCheck className="w-12 h-12 mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-medium">No drivers in this verification queue.</p>
          </div>
        ) : (
          filteredDrivers.map((driver) => {
            const isVerified = driver.kycStatus === 'VERIFIED';
            const isPending = driver.kycStatus === 'PENDING';
            const isSuspended = driver.status === 'SUSPENDED';

            return (
              <div
                key={driver.id}
                id={`driver-kyc-card-${driver.id}`}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-500/60 bg-amber-950/10'
                    : isSuspended
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                            driver.status === 'ONLINE_IDLE'
                              ? 'bg-emerald-500'
                              : driver.status === 'ONLINE_BUSY'
                              ? 'bg-blue-500'
                              : driver.status === 'SUSPENDED'
                              ? 'bg-rose-500'
                              : 'bg-slate-600'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-100">{driver.name}</h3>
                          {isVerified && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> KYC Verified
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Documents Review
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{driver.phone}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">★ {driver.rating}</span>
                          <span>•</span>
                          <span>{driver.totalTrips} trips</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {currencySymbol}
                        {driver.walletBalance.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">Wallet Balance</div>
                    </div>
                  </div>

                  {/* Vehicle & Metrics Section */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 py-2 bg-slate-950/60 rounded-xl p-2.5 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Vehicle</div>
                      <div className="font-semibold text-slate-200 truncate">
                        {driver.vehicle.make} {driver.vehicle.model}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {driver.vehicle.plateNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Tier</div>
                      <div className="font-bold text-emerald-400 text-[11px] truncate">
                        {driver.vehicle.tier}
                      </div>
                      <div className="text-[9px] text-slate-500">Year {driver.vehicle.year}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Acceptance Rate</div>
                      <div className="font-bold text-slate-200 font-mono">
                        {driver.acceptanceRate}%
                      </div>
                      <div className="text-[9px] text-slate-500">{driver.completionRate}% complete</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Safety Score</div>
                      <div className="font-bold text-emerald-400 font-mono">
                        {driver.safetyScore}/100
                      </div>
                      <div className="text-[9px] text-slate-500">Zero incidents</div>
                    </div>
                  </div>

                  {/* Documents badges */}
                  <div className="space-y-1 mb-3">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Submitted Documents:</span>
                      <span className="text-[10px] text-slate-500">
                        {driver.documents.length} files attached
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {driver.documents.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">No documents uploaded yet</span>
                      ) : (
                        driver.documents.map((doc) => (
                          <button
                            key={doc.id}
                            id={`btn-view-doc-${doc.id}`}
                            onClick={() => {
                              setInspectingDriver(driver);
                              setInspectingDoc(doc);
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border transition-all ${
                              doc.status === 'APPROVED'
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                : doc.status === 'PENDING'
                                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{doc.name}</span>
                            <Eye className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-locate-driver-map-${driver.id}`}
                      onClick={() => onSelectDriverForMap(driver)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Car className="w-3 h-3 text-emerald-400" />
                      GPS Track
                    </button>

                    <button
                      id={`btn-toggle-suspend-${driver.id}`}
                      onClick={() => onToggleDriverSuspension(driver.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isSuspended
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      }`}
                    >
                      {isSuspended ? (
                        <>
                          <Unlock className="w-3 h-3" /> Unsuspend
                        </>
                      ) : (
                        <>
                          <Ban className="w-3 h-3" /> Suspend
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <>
                        <button
                          id={`btn-approve-kyc-${driver.id}`}
                          onClick={() => handleApproveWithCelebration(driver.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve KYC
                        </button>
                        <button
                          id={`btn-open-reject-kyc-${driver.id}`}
                          onClick={() => {
                            setInspectingDriver(driver);
                            setShowRejectInput(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        id={`btn-inspect-driver-${driver.id}`}
                        onClick={() => {
                          setInspectingDriver(driver);
                          setInspectingDoc(driver.documents[0] || null);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        Inspect Dossier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Inspection & Approval Modal */}
      {inspectingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingDriver.avatar}
                  alt={inspectingDriver.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {inspectingDriver.name} • KYC Dossier
                  </h2>
                  <p className="text-xs text-slate-400">
                    {inspectingDriver.vehicle.year} {inspectingDriver.vehicle.make}{' '}
                    {inspectingDriver.vehicle.model} ({inspectingDriver.vehicle.plateNumber})
                  </p>
                </div>
              </div>
              <button
                id="btn-close-kyc-modal"
                onClick={() => {
                  setInspectingDriver(null);
                  setInspectingDoc(null);
                  setShowRejectInput(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Document selector tabs inside modal */}
            <div className="flex items-center gap-2 my-4 overflow-x-auto pb-2 border-b border-slate-800">
              {inspectingDriver.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setInspectingDoc(doc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    inspectingDoc?.id === doc.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {doc.name}
                </button>
              ))}
            </div>

            {/* Document Viewer */}
            {inspectingDoc ? (
              <div className="space-y-4">
                <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] p-2">
                  <img
                    src={inspectingDoc.fileUrl}
                    alt={inspectingDoc.name}
                    className="max-h-[380px] object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
                    Expires: {inspectingDoc.expiryDate}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/60 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-500">Document Type:</span>{' '}
                    <strong className="text-slate-200">{inspectingDoc.type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Uploaded On:</span>{' '}
                    <strong className="text-slate-200">{inspectingDoc.uploadedAt}</strong>
                  </div>
                  {inspectingDoc.notes && (
                    <div className="col-span-2 text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/40">
                      <strong>Rejection Note:</strong> {inspectingDoc.notes}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">No documents found for inspection.</div>
            )}

            {/* Rejection input box */}
            {showRejectInput && (
              <div className="mt-4 p-3 bg-rose-950/20 border border-rose-900/50 rounded-xl space-y-2">
                <label className="text-xs font-bold text-rose-300">Specify Rejection Reason:</label>
                <select
                  id="select-kyc-reject-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs p-2 rounded-lg"
                >
                  <option value="Expired or invalid documentation">Expired or invalid documentation</option>
                  <option value="Blurry / unreadable photo upload">Blurry / unreadable photo upload</option>
                  <option value="Vehicle registration plate number mismatch">Vehicle registration plate number mismatch</option>
                  <option value="Background check flagged safety requirement">Background check flagged safety requirement</option>
                  <option value="Vehicle model does not qualify for selected tier">Vehicle model does not qualify for selected tier</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1 rounded bg-slate-800 text-slate-400 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-confirm-reject-kyc"
                    onClick={() => {
                      onRejectDriverKyc(inspectingDriver.id, rejectionReason);
                      setInspectingDriver(null);
                    }}
                    className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Assign Vehicle Tier:</span>
                <select
                  id={`select-driver-tier-${inspectingDriver.id}`}
                  value={inspectingDriver.vehicle.tier}
                  onChange={(e) =>
                    onUpdateDriverTier(inspectingDriver.id, e.target.value as VehicleTier)
                  }
                  className="bg-slate-800 border border-slate-700 text-xs px-2.5 py-1 rounded-lg text-emerald-400 font-bold"
                >
                  <option value="Economy">Economy</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Black / XL">Black / XL</option>
                  <option value="Moto">Moto</option>
                  <option value="Freight / Delivery">Freight / Delivery</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-modal-approve-kyc"
                  onClick={() => handleApproveWithCelebration(inspectingDriver.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Driver Fleet License
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
