export type ServiceMode = 'ALL' | 'UBER_DISPATCH' | 'INDRIVE_BIDDING' | 'COURIER' | 'CITY_TO_CITY';

export type DriverStatus = 'ONLINE_IDLE' | 'ONLINE_BUSY' | 'EN_ROUTE' | 'OFFLINE' | 'SUSPENDED';

export type KycStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED';

export type VehicleTier = 'Economy' | 'Comfort' | 'Black / XL' | 'Moto' | 'Freight / Delivery';

export interface DocumentItem {
  id: string;
  name: string;
  type: 'LICENSE' | 'REGISTRATION' | 'INSURANCE' | 'BACKGROUND_CHECK' | 'VEHICLE_INSPECTION';
  fileUrl: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  expiryDate: string;
  uploadedAt: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number; // percentage
  completionRate: number; // percentage
  cancellationRate: number; // percentage
  status: DriverStatus;
  kycStatus: KycStatus;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    tier: VehicleTier;
  };
  currentLat: number;
  currentLng: number;
  heading: number; // 0-360 degrees for vehicle orientation
  walletBalance: number;
  biddingAllowed: boolean;
  documents: DocumentItem[];
  joinedDate: string;
  safetyScore: number; // 0-100
  city: string;
}

export interface Passenger {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  rating: number;
  totalRides: number;
  spentTotal: number;
  paymentMethod: 'CREDIT_CARD' | 'CASH' | 'WALLET' | 'APPLE_PAY';
  isVip: boolean;
  status: 'ACTIVE' | 'FLAGGED' | 'BANNED';
  city: string;
  joinedDate: string;
}

export type TripStatus =
  | 'REQUESTED'
  | 'BIDDING_ACTIVE'
  | 'DRIVER_ASSIGNED'
  | 'ARRIVED_PICKUP'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface DriverBid {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  rating: number;
  vehicleModel: string;
  vehiclePlate: string;
  bidFare: number;
  originalPassengerFare: number;
  etaMin: number;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
}

export interface SafetyAlert {
  id: string;
  triggeredBy: 'PASSENGER' | 'DRIVER' | 'SYSTEM_TELEMETRY';
  type: 'SOS_BUTTON' | 'ROUTE_DEVIATION' | 'UNUSUAL_LONG_STOP' | 'CRASH_DETECTION' | 'SPEEDING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  actionsTaken?: string[];
}

export interface RideTrip {
  id: string;
  trackingNumber: string;
  serviceType: 'UBER_AUTO_DISPATCH' | 'INDRIVE_FARE_BIDDING' | 'COURIER' | 'CITY_TO_CITY';
  status: TripStatus;
  passenger: Passenger;
  driver?: Driver;
  origin: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  currentLat?: number;
  currentLng?: number;
  distanceKm: number;
  estimatedDurationMin: number;
  routePoints: [number, number][]; // coordinates for Leaflet polyline

  // inDrive Dynamic Bidding
  passengerOfferedFare: number;
  driverBids: DriverBid[];
  acceptedBidId?: string;

  // Fare breakdown
  finalFare: number;
  baseFare: number;
  distanceFare: number;
  surgeMultiplier: number;
  platformCommissionRate: number; // e.g. 0.10 (10% inDrive) or 0.22 (22% Uber)
  platformCommissionAmount: number;
  driverPayout: number;
  paymentMethod: 'CREDIT_CARD' | 'CASH' | 'WALLET' | 'APPLE_PAY';
  isPaid: boolean;

  // Telemetry & Safety
  safetyAlerts: SafetyAlert[];
  telemetry: {
    currentSpeedKmH: number;
    maxSpeedKmH: number;
    hardBrakesCount: number;
    routeDeviationMeters: number;
  };

  timeline: Array<{
    time: string;
    status: string;
    note: string;
  }>;

  createdAt: string;
  completedAt?: string;
  ratingGivenByPassenger?: number;
  passengerReview?: string;
  disputeReason?: string;
}

export interface SurgeZone {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  areaPolygon?: [number, number][];
  currentMultiplier: number; // e.g. 1.2 to 3.5
  demandLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SURGE_EXTREME';
  activeDriversCount: number;
  waitingRequestsCount: number;
  minBidFloor: number; // inDrive minimum fare floor
  maxBidCeilingPercent: number; // e.g. max +50% above passenger offer
  isEnabled: boolean;
  color: string;
}

export interface PayoutRequest {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  amount: number;
  payoutMethod: 'STRIPE_INSTANT' | 'BANK_ACH' | 'DEBIT_CARD' | 'PAYPAL';
  accountDetails: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  requestedAt: string;
  processedAt?: string;
  referenceCode: string;
}

export interface DisputeTicket {
  id: string;
  tripId: string;
  tripTrackingNumber: string;
  passengerName: string;
  driverName: string;
  category: 'FARE_OVERCHARGE' | 'ROUTE_DEVIATION' | 'UNPROFESSIONAL_BEHAVIOR' | 'VEHICLE_CONDITION' | 'LOST_ITEM' | 'CANCELLATION_PENALTY';
  status: 'OPEN' | 'INVESTIGATING' | 'REFUNDED' | 'DISMISSED' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  disputedAmount: number;
  suggestedAction: string;
  createdAt: string;
}

export interface PlatformConfig {
  uberCommissionRate: number; // e.g. 22%
  inDriveCommissionRate: number; // e.g. 9.5%
  courierCommissionRate: number; // e.g. 12%
  cityToCityCommissionRate: number; // e.g. 8%
  currencySymbol: string;
  currencyCode: string;
  autoDispatchRadiusKm: number;
  biddingTimeLimitSeconds: number;
  maxDriverBidIncreasePercent: number;
  sosEmergencyPhoneNumber: string;
  enableAiFraudDetection: boolean;
  enableDynamicWeatherSurge: boolean;
}

export interface PlatformLiveMetrics {
  totalGmv: number;
  platformNetRevenue: number;
  todayCompletedTrips: number;
  activeTripsNow: number;
  onlineDrivers: number;
  biddingRoundsToday: number;
  avgAcceptanceSeconds: number;
  avgDriverRating: number;
  openSafetyAlerts: number;
  pendingKycCount: number;
}
