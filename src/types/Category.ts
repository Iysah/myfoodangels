export interface Category {
  id: string;
  name: string;
  desc: string;
  image: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  loystarId: number;
}

export interface CategoryWithProducts extends Category {
  products: string[]; // Array of product IDs
}