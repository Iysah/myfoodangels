export interface DeliveryLocation {
  id: string;
  location: string;
  price: number;
  slug: string;
  isActive: boolean;
  estimatedDeliveryTime?: string; // e.g., "2-3 hours"
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CheckoutBillingAddress {
  fullName: string;
  email: string;
  phoneNumber: string;
  deliveryAddress: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}