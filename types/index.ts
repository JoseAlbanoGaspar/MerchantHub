// =============================================================================
// Application-wide TypeScript types
// These mirror the Supabase database schema exactly.
// =============================================================================

export type StoreStatus = 'active' | 'inactive';
export type ProductStatus = 'available' | 'unavailable';

export interface Merchant {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  merchant_id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  timezone: string;
  status: StoreStatus;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Form input types (subset used in create / update operations)
// ---------------------------------------------------------------------------
export type StoreFormData = {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  timezone: string;
};

export type ProductFormData = {
  name: string;
  description: string;
  price: string; // kept as string for form inputs; coerced to number on submit
  status: ProductStatus;
};

// ---------------------------------------------------------------------------
// US Timezones available in the store form
// ---------------------------------------------------------------------------
export const US_TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern Time (ET)' },
  { value: 'America/Chicago',     label: 'Central Time (CT)' },
  { value: 'America/Denver',      label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage',   label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time (HT)' },
] as const;

// ---------------------------------------------------------------------------
// US States (2-letter codes) for the store form
// ---------------------------------------------------------------------------
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },    { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },    { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },{ value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },    { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },     { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },   { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },       { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },   { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },      { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },   { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },   { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },       { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },     { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },      { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },    { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },  { value: 'WY', label: 'Wyoming' },
] as const;
