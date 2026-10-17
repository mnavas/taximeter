// Shared TypeScript types, aligned with supabase/migrations.
// Kept intentionally small for v0.0.0; expanded as features land.

export type FareParameterKey =
  | "flagfall"
  | "per_km"
  | "per_min_wait"
  | "night_surcharge"
  | "booking_fee"
  | "minimum_fare";

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  timezone: string;
  contact: string | null;
  availability_radius_m: number;
  request_timeout_s: number;
  wait_time_billing: boolean;
  wait_speed_threshold: number;
  payment_qr_scope: "per_driver" | "company";
  payment_fraud_check: boolean;
  require_passenger_accounts: boolean;
}

export interface Driver {
  id: string;
  name: string;
  photo_url: string | null;
  licence_no: string | null;
  phone: string | null;
  status: "active" | "suspended";
}

export interface Taxi {
  id: string;
  plate: string;
  make: string | null;
  model: string | null;
  color: string | null;
  photo_url: string | null;
  allowed_tiers: string[];
  status: "active" | "suspended";
  current_driver_id: string | null;
}

export interface FareTier {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  sort_order: number;
}

export interface FareParameter {
  id: string;
  tier_id: string;
  key: FareParameterKey;
  amount: number;
  unit: string | null;
}

export interface Trip {
  id: string;
  driver_id: string | null;
  taxi_id: string | null;
  passenger_id: string | null;
  tier_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  distance_m: number;
  duration_s: number;
  wait_s: number;
  fare_total: number;
  code_verified: boolean;
  payment_method: "cash" | "qr" | null;
  settlement_status: "unpaid" | "pending" | "settled";
  status: "active" | "completed" | "cancelled";
}
