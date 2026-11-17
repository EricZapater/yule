export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Edition {
  id: string;
  year: number;
  name: string;
  budget_limit: number;
  status: 'draft' | 'wishlists_open' | 'drawn' | 'closed';
  drawn_at: string | null;
  created_at?: string;
}

export interface WishlistItem {
  id: string;
  edition_id: string;
  title: string;
  price_estimated?: number | null;
  url?: string | null;
  image_url?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface AssignedWishlistItem extends WishlistItem {
  is_marked_by_me: boolean;
}

export interface AssignmentResponse {
  recipient: {
    id: string;
    name: string;
  };
  budget_limit: number;
  wishlist: AssignedWishlistItem[];
}

export interface MemberAdminView {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  wishlist_items_count: number;
  magic_link_url: string;
  created_at: string;
}

export interface Incompatibility {
  id: string;
  person1: { id: string; name: string };
  person2: { id: string; name: string };
  is_mutual: boolean;
  notes?: string | null;
  created_at: string;
}

export interface ViabilityCheckResponse {
  is_viable: boolean;
  participants_count: number;
  active_rules_count: number;
  reason?: string | null;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'PANIC';
  status: number;
  method: string;
  path: string;
  latency_ms: number;
  client_ip: string;
  user_id?: string;
  request_id: string;
  error_code?: string;
  error_message?: string;
  request_body?: string;
}
