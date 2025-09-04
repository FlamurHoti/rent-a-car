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

export const FUEL_OPTIONS   = Object.keys(FUEL_LABELS);
export const TRANS_OPTIONS  = Object.keys(TRANS_LABELS);
export const STATUS_OPTIONS = Object.keys(CAR_STATUS_LABELS);