export const FUEL_LABELS = {
  PETROL:   'Petrol',
  DIESEL:   'Diesel',
  ELECTRIC: 'Electric',
  HYBRID:   'Hybrid',
  LPG:      'LPG',
};

export const TRANS_LABELS = {
  MANUAL:    'Manual',
  AUTOMATIC: 'Automatic',
};

export const CAR_STATUS_LABELS = {
  AVAILABLE:   'Available',
  RESERVED:    'Reserved',
  MAINTENANCE: 'Maintenance',
};

export const RESERVATION_STATUS_LABELS = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS = {
  PENDING:   'Pending',
  COMPLETED: 'Completed',
  FAILED:    'Failed',
  REFUNDED:  'Refunded',
};

export const METHOD_LABELS = {
  CASH:   'Cash',
  BANK:   'Bank',
  ONLINE: 'Online',
};

/** Tailwind color classes keyed by lowercase status. */
export const STATUS_COLORS = {
  available:   'bg-emerald-100 text-emerald-700',
  reserved:    'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
  pending:     'bg-slate-100 text-slate-700',
  confirmed:   'bg-blue-100 text-blue-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-red-100 text-red-700',
  failed:      'bg-red-100 text-red-700',
  refunded:    'bg-amber-100 text-amber-700',
};

export const FUEL_OPTIONS   = Object.keys(FUEL_LABELS);
export const TRANS_OPTIONS  = Object.keys(TRANS_LABELS);
export const STATUS_OPTIONS = Object.keys(CAR_STATUS_LABELS);
