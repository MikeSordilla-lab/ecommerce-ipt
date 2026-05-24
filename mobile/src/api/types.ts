export type Role = "admin" | "seller" | "customer";

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_approved: boolean;
  profile_image_url?: string | null;
  created_at?: string;
};

export type Product = {
  id: number;
  category_id: number;
  seller_id: number | null;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_path?: string | null;
  image_url?: string | null;
  is_active: boolean;
  category_name?: string;
  seller_name?: string;
  wishlisted?: boolean;
  wishlist_id?: number;
};

export type Category = {
  id: number;
  name: string;
};

export type CartItem = {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
  subtotal: number;
  image_url?: string | null;
};

export type Address = {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  is_default: boolean;
};

export type Order = {
  id: number;
  user_id: number;
  username?: string;
  total: number;
  status: "pending" | "shipped" | "delivered";
  payment_method: string;
  payment_label: string;
  payment_status_label: string;
  shipping_address: {
    full_name?: string;
    phone?: string;
    address?: string;
  };
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
};
